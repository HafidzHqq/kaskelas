'use client';

import { FileText, FileSpreadsheet } from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { Transaction } from '@/types/index';
import { formatCurrency, formatDate } from '@/lib/constants';

interface ReportExportProps {
  transactions: Transaction[];
  stats: {
    totalSaldo: number;
    totalPemasukan: number;
    totalPengeluaran: number;
    jumlahTransaksi: number;
  };
}

export default function ReportExport({ transactions, stats }: ReportExportProps) {
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    doc.setFillColor(11, 14, 17);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    doc.setTextColor(252, 213, 53);
    doc.setFontSize(18);
    doc.text('Laporan Kas Kelas', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    const date = new Date();
    doc.text(`Tanggal: ${formatDate(date.toISOString())}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 12;

    doc.setFillColor(30, 35, 41);
    doc.rect(15, yPosition - 8, pageWidth - 30, 30, 'F');
    doc.setTextColor(252, 213, 53);
    doc.setFontSize(11);
    doc.text('RINGKASAN', 20, yPosition);

    yPosition += 8;
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(`Saldo: ${formatCurrency(stats.totalSaldo)}`, 20, yPosition);
    doc.text(`Pemasukan: ${formatCurrency(stats.totalPemasukan)}`, 95, yPosition);
    yPosition += 6;
    doc.text(`Pengeluaran: ${formatCurrency(stats.totalPengeluaran)}`, 20, yPosition);
    doc.text(`Total Transaksi: ${stats.jumlahTransaksi}`, 95, yPosition);
    yPosition += 15;

    doc.setTextColor(252, 213, 53);
    doc.setFontSize(11);
    doc.text('DAFTAR TRANSAKSI', 20, yPosition);
    yPosition += 8;

    const tableData = transactions.map(tx => [
      formatDate(tx.date),
      tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      tx.description,
      tx.category || '-',
      formatCurrency(tx.amount),
    ]);

    doc.setTextColor(112, 122, 138);
    doc.setFontSize(8);
    const headers = ['Tanggal', 'Tipe', 'Deskripsi', 'Kategori', 'Jumlah'];
    const columnWidths = [25, 20, 40, 25, 30];
    let xPosition = 15;

    headers.forEach((header, i) => {
      doc.text(header, xPosition, yPosition);
      xPosition += columnWidths[i];
    });
    yPosition += 6;

    doc.setDrawColor(43, 49, 57);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 4;

    doc.setTextColor(255, 255, 255);
    tableData.forEach((row, idx) => {
      if (yPosition > pageHeight - 15) {
        doc.addPage();
        doc.setFillColor(11, 14, 17);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        yPosition = 20;
      }

      if (idx % 2 === 0) {
        doc.setFillColor(30, 35, 41);
        doc.rect(15, yPosition - 3, pageWidth - 30, 4, 'F');
      }

      xPosition = 15;
      row.forEach((cell, i) => {
        const align = i === 4 ? 'right' : 'left';
        doc.text(cell, xPosition, yPosition, { maxWidth: columnWidths[i] - 2, align });
        xPosition += columnWidths[i];
      });
      yPosition += 5;
    });

    doc.save('Laporan_Kas_Kelas.pdf');
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const summaryData = [
      ['RINGKASAN KAS KELAS', ''],
      ['', ''],
      ['Saldo', stats.totalSaldo],
      ['Pemasukan', stats.totalPemasukan],
      ['Pengeluaran', stats.totalPengeluaran],
      ['Total Transaksi', stats.jumlahTransaksi],
    ];

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWs['!cols'] = [{ wch: 20 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Ringkasan');

    const transactionData = [
      ['Tanggal', 'Tipe', 'Deskripsi', 'Kategori', 'Jumlah'],
      ...transactions.map(tx => [
        formatDate(tx.date),
        tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        tx.description,
        tx.category || '-',
        tx.amount,
      ]),
    ];

    const transactionWs = XLSX.utils.aoa_to_sheet(transactionData);
    transactionWs['!cols'] = [
      { wch: 15 },
      { wch: 15 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(wb, transactionWs, 'Transaksi');

    XLSX.writeFile(wb, 'Laporan_Kas_Kelas.xlsx');
  };

  return (
    <div className="bg-surface-card-dark rounded-lg p-4 sm:p-6 border border-hairline-on-dark">
      <h3 className="text-lg font-semibold text-on-dark mb-4">Export Laporan</h3>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleExportPDF}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <FileText size={20} />
          Export PDF
        </button>
        
        <button
          onClick={handleExportExcel}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <FileSpreadsheet size={20} />
          Export Excel
        </button>
      </div>
    </div>
  );
}
