#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
export PATH="$HOME/.local/bin:$PATH"
LOCAL_OVERLAY_DIR="${SCRIPT_DIR}/overlays/local"

NAMESPACE="motormatch"
BACKEND_IMAGE="motormatch-backend:latest"
FRONTEND_IMAGE="motormatch-frontend:latest"
PORT_FORWARD_PID_FILE="/tmp/motormatch-frontend-portforward.pid"
PORT_FORWARD_LOG_FILE="/tmp/motormatch-frontend-portforward.log"

usage() {
  cat <<EOF
Usage: bash k8s/local.sh <up|down|status|logs>

Commands:
  up       Build images, apply the local overlay, wait for readiness,
           and expose the frontend at http://localhost:8080.
  down     Stop the port-forward and delete the local overlay.
  status   Show the current pods and services in the motormatch namespace.
  logs     Tail logs for a component: backend or frontend.
EOF
}

cluster_context() {
  kubectl config current-context 2>/dev/null || true
}

bootstrap_kind_cluster() {
  if ! command -v kind >/dev/null 2>&1; then
    return 1
  fi

  local cluster_name="${KIND_CLUSTER_NAME:-motormatch-local}"
  local current_context=""

  current_context="$(cluster_context)"

  if [[ "${current_context}" == "kind-${cluster_name}" ]]; then
    return 0
  fi

  if kind get clusters 2>/dev/null | grep -qx "${cluster_name}"; then
    echo "Using existing kind cluster: ${cluster_name}"
  else
    echo "Creating kind cluster: ${cluster_name}"
    kind create cluster --name "${cluster_name}"
  fi

  kubectl config use-context "kind-${cluster_name}" >/dev/null
}

ensure_cluster_access() {
  local current_context=""
  current_context="$(cluster_context)"

  if [[ -z "${current_context}" ]]; then
    if bootstrap_kind_cluster; then
      current_context="$(cluster_context)"
    else
      cat >&2 <<EOF
No Kubernetes context is configured and kind is not available.
Start a local cluster first (Docker Desktop Kubernetes, kind or minikube), then rerun:
  bash k8s/local.sh up
EOF
      exit 1
    fi
  fi

  if ! kubectl cluster-info >/dev/null 2>&1; then
    cat >&2 <<EOF
Kubectl can see the context '${current_context}', but it cannot reach the cluster.
Start or fix that cluster, then rerun:
  bash k8s/local.sh up
EOF
    exit 1
  fi
}

require_tools() {
  command -v kubectl >/dev/null 2>&1 || {
    echo "kubectl is required" >&2
    exit 1
  }

  command -v docker >/dev/null 2>&1 || {
    echo "docker is required" >&2
    exit 1
  }
}

build_images() {
  echo "Building backend image: ${BACKEND_IMAGE}"
  docker build -t "${BACKEND_IMAGE}" -f "${ROOT_DIR}/backend/Dockerfile" "${ROOT_DIR}/backend"

  echo "Building frontend image: ${FRONTEND_IMAGE}"
  docker build -t "${FRONTEND_IMAGE}" -f "${ROOT_DIR}/Frontend/Dockerfile" "${ROOT_DIR}/Frontend"
}

load_images_into_cluster() {
  local current_context=""
  current_context="$(cluster_context)"

  if [[ "${current_context}" == kind-* ]] && command -v kind >/dev/null 2>&1; then
    local kind_cluster_name="${current_context#kind-}"
    echo "Loading images into kind cluster: ${kind_cluster_name}"
    kind load docker-image "${BACKEND_IMAGE}" --name "${kind_cluster_name}"
    kind load docker-image "${FRONTEND_IMAGE}" --name "${kind_cluster_name}"
    return
  fi

  if [[ "${current_context}" == "minikube" ]] && command -v minikube >/dev/null 2>&1; then
    echo "Loading images into minikube"
    minikube image load "${BACKEND_IMAGE}"
    minikube image load "${FRONTEND_IMAGE}"
    return
  fi

  echo "Skipping explicit image load. The current cluster context is '${current_context:-unknown}'."
}

apply_bundle() {
  kubectl delete statefulset/postgresql service/postgresql job/prisma-db-sync -n "${NAMESPACE}" --ignore-not-found >/dev/null 2>&1 || true
  kubectl apply -f "${LOCAL_OVERLAY_DIR}/namespace.yaml"
  create_supabase_secret
  kubectl apply -k "${LOCAL_OVERLAY_DIR}"
  kubectl rollout restart deployment/backend -n "${NAMESPACE}"
}

create_supabase_secret() {
  local env_file="${ROOT_DIR}/.env"

  if [[ ! -f "${env_file}" ]]; then
    cat >&2 <<EOF
Missing ${env_file}.
Add your Supabase connection strings there before running:
  bash k8s/local.sh up
EOF
    exit 1
  fi

  (
    set -a
    source "${env_file}"
    set +a

    : "${DATABASE_URL:?DATABASE_URL is required in .env}"
    : "${DIRECT_URL:?DIRECT_URL is required in .env}"
    : "${JWT_SECRET:?JWT_SECRET is required in .env}"

    kubectl create secret generic motormatch-secrets \
      -n "${NAMESPACE}" \
      --from-literal=DATABASE_URL="${DATABASE_URL}" \
      --from-literal=DIRECT_URL="${DIRECT_URL}" \
      --from-literal=JWT_SECRET="${JWT_SECRET}" \
      --from-literal=SMTP_USER="${SMTP_USER:-}" \
      --from-literal=SMTP_PASS="${SMTP_PASS:-}" \
      --dry-run=client -o yaml | kubectl apply -f -
  )
}

wait_for_resources() {
  kubectl rollout status deployment/backend -n "${NAMESPACE}" --timeout=300s
  kubectl rollout status deployment/frontend -n "${NAMESPACE}" --timeout=300s
}

stop_port_forward() {
  if [[ -f "${PORT_FORWARD_PID_FILE}" ]]; then
    local pid=""
    pid="$(cat "${PORT_FORWARD_PID_FILE}")"
    if kill -0 "${pid}" >/dev/null 2>&1; then
      kill "${pid}" >/dev/null 2>&1 || true
      wait "${pid}" >/dev/null 2>&1 || true
    fi
    rm -f "${PORT_FORWARD_PID_FILE}"
  fi
}

start_port_forward() {
  stop_port_forward
  nohup kubectl port-forward -n "${NAMESPACE}" svc/frontend 8080:80 >"${PORT_FORWARD_LOG_FILE}" 2>&1 &
  echo $! > "${PORT_FORWARD_PID_FILE}"
  echo "Frontend exposed at http://localhost:8080"
  echo "Port-forward log: ${PORT_FORWARD_LOG_FILE}"
}

up() {
  ensure_cluster_access
  build_images
  load_images_into_cluster
  apply_bundle
  wait_for_resources
  start_port_forward
}

down() {
  stop_port_forward
  kubectl delete statefulset/postgresql service/postgresql job/prisma-db-sync -n "${NAMESPACE}" --ignore-not-found >/dev/null 2>&1 || true
  kubectl delete -k "${LOCAL_OVERLAY_DIR}" --ignore-not-found >/dev/null 2>&1 || true
}

status() {
  ensure_cluster_access
  kubectl get pods,svc -n "${NAMESPACE}"
}

logs() {
  ensure_cluster_access
  local target="${1:-}"

  case "${target}" in
    backend)
      kubectl logs -n "${NAMESPACE}" -f deployment/backend
      ;;
    frontend)
      kubectl logs -n "${NAMESPACE}" -f deployment/frontend
      ;;
    postgresql|postgres|migrate|job)
      echo "This local overlay uses Supabase, so PostgreSQL and migration job logs are not available here." >&2
      exit 1
      ;;
    *)
      echo "Usage: bash k8s/local.sh logs {backend|frontend}" >&2
      exit 1
      ;;
  esac
}

main() {
  require_tools

  case "${1:-}" in
    up)
      up
      ;;
    down)
      down
      ;;
    status)
      status
      ;;
    logs)
      shift
      logs "${1:-}"
      ;;
    help|--help|-h|"")
      usage
      ;;
    *)
      usage >&2
      exit 1
      ;;
  esac
}

main "$@"