import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 20,
    marginBottom: 20,
  },
  logoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: 1,
  },
  logoAccent: {
    color: '#2563eb', // primary color
  },
  dateText: {
    fontSize: 10,
    color: '#64748b',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 20,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 20,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableHeaderRow: {
    backgroundColor: '#f8fafc',
  },
  tableColHeaderFirst: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 10,
  },
  tableColHeader: {
    width: '25%', // Adjust based on number of columns (3 motos max + 1 header col = 4 cols max)
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 10,
    alignItems: 'center',
  },
  tableColFirst: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 10,
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  tableCol: {
    width: '25%', // Adjust based on number of columns
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableCellHeaderLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#334155',
    textTransform: 'uppercase',
  },
  tableCellHeaderBrand: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  tableCellHeaderModel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
  },
  tableCellFirst: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
  },
  tableCell: {
    fontSize: 10,
    color: '#0f172a',
    textAlign: 'center',
  },
  motoImage: {
    width: 60,
    height: 40,
    objectFit: 'contain',
    marginBottom: 8,
  },
  highlightedCell: {
    backgroundColor: '#eff6ff', // Light blue background for highlighted features
  },
  highlightedText: {
    color: '#2563eb', // Primary blue for highlighted features
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
    fontStyle: 'italic',
  }
});

// Helpers
function formatCOP(price) {
  if (!price) return 'Consultar';
  return '$' + price.toLocaleString('es-CO');
}

export function ComparisonPDF({ motos, rows, highlights }) {
  const currentDate = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate dynamic width based on number of columns
  // 1 label column + up to 3 moto columns
  const numColumns = motos.length + 1;
  const colWidth = `${100 / numColumns}%`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoGroup}>
            <Text style={styles.logoText}>Motor<Text style={styles.logoAccent}>Match</Text></Text>
          </View>
          <Text style={styles.dateText}>Generado el: {currentDate}</Text>
        </View>

        <Text style={styles.title}>Comparación de Motocicletas</Text>

        {/* Table */}
        <View style={styles.table}>
          
          {/* Table Header Row */}
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <View style={[styles.tableColHeaderFirst, { width: colWidth }]}>
              <Text style={styles.tableCellHeaderLabel}>ESPECIFICACIONES</Text>
            </View>
            
            {motos.map((moto) => (
              <View key={`header-${moto.id}`} style={[styles.tableColHeader, { width: colWidth }]}>
                {/* Fallback url doesn't work in node pdf env if unsplash blocks, using safe images or omit if error */}
                {moto.imageUrl && moto.imageUrl.startsWith('http') && (
                  <Image src={moto.imageUrl} style={styles.motoImage} />
                )}
                <Text style={styles.tableCellHeaderBrand}>{moto.brand}</Text>
                <Text style={styles.tableCellHeaderModel}>{moto.model}</Text>
              </View>
            ))}
          </View>

          {/* Table Body Rows (from ROWS constant) */}
          {rows.map((row) => (
            <View key={`row-${row.key}`} style={styles.tableRow}>
              {/* Feature Label Col */}
              <View style={[styles.tableColFirst, { width: colWidth }]}>
                <Text style={styles.tableCellFirst}>{row.label}</Text>
              </View>

              {/* Moto Value Cols */}
              {motos.map((moto) => {
                const isHighlighted = highlights?.[row.key] === moto.id;
                
                let val = '';
                if (row.key === 'price') val = formatCOP(moto[row.key]);
                else if (row.key === 'engineCc') val = moto[row.key] ? `${moto[row.key]} cc` : '—';
                else if (row.key === 'powerHp') val = moto[row.key] ? `${Number(moto[row.key])} HP` : '—';
                else if (row.key === 'weightKg') val = moto[row.key] ? `${Number(moto[row.key])} kg` : '—';
                else if (row.key === 'seatHeightCm') val = moto[row.key] ? `${moto[row.key]} cm` : '—';
                else if (row.key === 'consumptionKmpl') val = moto[row.key] ? `${Number(moto[row.key])} km/l` : '—';
                else val = moto[row.key] || '—';

                return (
                  <View 
                    key={`cell-${moto.id}-${row.key}`} 
                    style={[
                      styles.tableCol, 
                      { width: colWidth }, 
                      isHighlighted ? styles.highlightedCell : {}
                    ]}
                  >
                    <Text style={[
                      styles.tableCell,
                      isHighlighted ? styles.highlightedText : {}
                    ]}>
                      {val}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Los precios y datos son estimados. Consultar con el concesionario oficial para información exacta.
          </Text>
        </View>

      </Page>
    </Document>
  );
}
