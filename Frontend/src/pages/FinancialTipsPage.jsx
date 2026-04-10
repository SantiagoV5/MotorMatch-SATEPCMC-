import { useNavigate } from 'react-router-dom';
import './FinancialTipsPage.css';

export default function FinancialTipsPage() {
  const navigate = useNavigate();

  const tips = [
    {
      title: '🟢 Compras Saludables (< 20% de ingresos)',
      icon: '✅',
      sections: [
        {
          heading: 'Mantén tu estabilidad',
          items: [
            'Continúa ahorrando para emergencias',
            'No comprometas otros gastos importantes',
            'Planifica el mantenimiento preventivo',
            'Considera póliza de seguro integral',
          ],
        },
        {
          heading: 'Consejos de inversión',
          items: [
            'Esta es la compra más segura',
            'Puedes hacer el pago al contado o con financiamiento cómodo',
            'Aumenta tu fondo de emergencia a 6 meses',
            'Considera mantener un fondo para reparaciones imprevistas',
          ],
        },
      ],
    },
    {
      title: '🟡 Compras Ajustadas (20-30% de ingresos)',
      icon: '⚠️',
      sections: [
        {
          heading: 'Antes de comprar',
          items: [
            'Asegúrate de tener un fondo de emergencia de 3+ meses',
            'Verifica que tus gastos fijos sean manejables',
            'No tengas deudas de alto interés',
            'Considera Si puedes hacer un pago inicial mayor',
          ],
        },
        {
          heading: 'Toma precauciones',
          items: [
            'Presupuesta para reparaciones (neumáticos, mantenimiento)',
            'Los gastos de moto aumentan con el tiempo',
            'Considera gastos inesperados de salud o trabajo',
            'Evalúa Si una moto más económica te daría más tranquilidad',
          ],
        },
        {
          heading: 'Financiamiento responsable',
          items: [
            'Negocia plazos más largos si es posible',
            'Compara tasas de interés entre bancos',
            'No sobre-endeudes con cuotas muy altas',
            'Mantén un margen de seguridad en tu presupuesto',
          ],
        },
      ],
    },
    {
      title: '🔴 Compras Riesgosas (> 30% de ingresos)',
      icon: '🛑',
      sections: [
        {
          heading: 'Reflexiona bien',
          items: [
            'Esta compra representa un riesgo financiero importante',
            'El costo de la moto consume más del 30% de tus ingresos',
            'Mayor riesgo de endeudamiento no sostenible',
            'Posibles problemas para cubrir gastos de emergencia',
          ],
        },
        {
          heading: 'Alternativas que deberías considerar',
          items: [
            'Busca una motocicleta más económica',
            'Aplaza la compra y ahorra más tiempo',
            'Aumenta tus ingresos antes de comprar',
            'Obtén apoyo de familiares si es posible',
            'Espera a tener mejor estabilidad financiera',
          ],
        },
        {
          heading: '🚫 Lo que NO deberías hacer',
          items: [
            'No comprometas más del 30% de tus ingresos',
            'No descuides gastos esenciales (alimento, vivienda, salud)',
            'No solicites créditos adicionales para la compra',
            'No abandones tu fondo de emergencia',
            'No ignore mensajes financieros de advertencia',
          ],
        },
      ],
    },
    {
      title: '💡 Consejos Generales de Finanzas Personales',
      icon: '💰',
      sections: [
        {
          heading: 'Planificación financiera',
          items: [
            'Mantén un presupuesto mensual actualizado',
            'Registra todos tus ingresos y gastos',
            'Identifica gastos innecesarios',
            'Prioriza ahorro sobre deuda',
          ],
        },
        {
          heading: 'Crear fondo de emergencia',
          items: [
            'Objetivo: 3-6 meses de gastos fijos',
            'Comienza con 200ke mensuales',
            'Mantente en cuenta separada y de fácil acceso',
            'Úsalo solo para emergencias reales',
          ],
        },
        {
          heading: 'Gestión de deuda',
          items: [
            'Paga más que el mínimo cuando sea posible',
            'Prioriza deudas de alto interés primero',
            'Evita créditos de corto plazo (gota a gota)',
            'Negocia mejores condiciones con acreedores',
          ],
        },
        {
          heading: 'Inversiones inteligentes',
          items: [
            'La moto es un gasto, no una inversión',
            'Considera fondos de inversión para ahorros',
            'Edúcate sobre opciones de inversión',
            'Diversifica tu dinero en múltiples opciones',
          ],
        },
      ],
    },
  ];

  return (
    <div className="financial-tips-page">
      <header className="tips-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Volver
        </button>
        <h1>📚 Guía de Compra Responsable</h1>
        <p>Aprende a tomar decisiones financieras inteligentes</p>
      </header>

      <main className="tips-content">
        {tips.map((section, idx) => (
          <section key={idx} className="tip-section">
            <div className="section-header">
              <span className="section-icon">{section.icon}</span>
              <h2>{section.title}</h2>
            </div>

            <div className="section-body">
              {section.sections.map((subsection, sidx) => (
                <div key={sidx} className="subsection">
                  <h3>{subsection.heading}</h3>
                  <ul className="tips-list">
                    {subsection.items.map((item, iidx) => (
                      <li key={iidx}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="tips-footer">
        <div className="footer-content">
          <h3>🎯 Resumen</h3>
          <p>
            El mejor indicador de si puedes comprar una moto es tu tranquilidad financiera. 
            Si tienes que elegir entre pagar la moto o tus necesidades básicas, espera a tener 
            más estabilidad. Tu futuro agradecido.
          </p>
        </div>
      </footer>
    </div>
  );
}
