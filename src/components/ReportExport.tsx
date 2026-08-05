'use client';

import { FileText, FileSpreadsheet } from 'lucide-react';
import { jsPDF } from 'jspdf';
import ExcelJS from 'exceljs';
import { Transaction } from '@/types/index';
import { members, formatCurrency, formatDate } from '@/lib/constants';

interface ReportExportProps {
  transactions: Transaction[];
  stats: {
    totalSaldo: number;
    totalPemasukan: number;
    totalPengeluaran: number;
    jumlahTransaksi: number;
  };
}

function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  // IDM and other download managers intercept blob URLs and name them as UUIDs.
  // Appending the filename in a hash fragment (#filename.ext) forces them to parse and use it.
  const downloadUrl = `${url}#${filename}`;
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 60000);
}

export default function ReportExport({ transactions, stats }: ReportExportProps) {
  // Helper to calculate member payments status
  const getMemberStats = () => {
    // Get unique dates of income transactions with member payments
    const availableDates = Array.from(
      new Set(
        transactions
          .filter(tx => tx.type === 'income' && tx.memberIds && tx.memberIds.length > 0)
          .map(tx => tx.date)
      )
    ).sort();

    const memberStats = members.map((member, index) => {
      let totalPaid = 0;
      const paymentsByDate: Record<string, number> = {};

      transactions.forEach((tx) => {
        if (tx.type === 'income' && tx.memberIds?.includes(member.id)) {
          const amountPerMember = tx.amount / tx.memberIds.length;
          totalPaid += amountPerMember;

          if (!paymentsByDate[tx.date]) {
            paymentsByDate[tx.date] = 0;
          }
          paymentsByDate[tx.date] += amountPerMember;
        }
      });

      return {
        no: index + 1,
        name: member.name,
        totalPaid,
        paymentsByDate,
      };
    });

    return { availableDates, memberStats };
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    const { availableDates, memberStats } = getMemberStats();

    // =========================================================================
    // PAGE 1: COVER & TRANSACTIONS
    // =========================================================================
    
    // Header/Kop Surat Formal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(17, 24, 39);
    doc.text('LAPORAN KEUANGAN KAS KELAS', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    const todayStr = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.text(`Tanggal Cetak: ${todayStr}`, pageWidth / 2, yPosition, { align: 'center' });
    
    // Line divider
    yPosition += 6;
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.5);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 12;

    // Summary Box (Formal Grid)
    doc.setFillColor(249, 250, 251); // Soft grey background
    doc.roundedRect(15, yPosition, pageWidth - 30, 24, 2, 2, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(15, yPosition, pageWidth - 30, 24, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text('SALDO KAS KELAS', 22, yPosition + 8);
    doc.text('TOTAL PEMASUKAN', 82, yPosition + 8);
    doc.text('TOTAL PENGELUARAN', 142, yPosition + 8);

    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.text(formatCurrency(stats.totalSaldo), 22, yPosition + 17);
    doc.text(formatCurrency(stats.totalPemasukan), 82, yPosition + 17);
    doc.text(formatCurrency(stats.totalPengeluaran), 142, yPosition + 17);
    yPosition += 35;

    // Section 1: Daftar Transaksi
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text('I. RIWAYAT TRANSAKSI KAS KELAS', 15, yPosition);
    yPosition += 6;

    // Table Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(31, 41, 55); // Dark Slate Header
    doc.rect(15, yPosition, pageWidth - 30, 9, 'F');

    const columnWidths = [12, 25, 22, 63, 30, 28]; // total 180
    const headers = ['No', 'Tanggal', 'Tipe', 'Deskripsi', 'Kategori/Sumber', 'Jumlah'];

    let xPosition = 15;
    headers.forEach((header, i) => {
      const align = i === 5 ? 'right' : 'left';
      const drawX = align === 'right' ? xPosition + columnWidths[i] - 2 : xPosition + 2;
      doc.text(header, drawX, yPosition + 6, { align });
      xPosition += columnWidths[i];
    });
    yPosition += 9;

    // Table Rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(55, 65, 81);

    transactions.forEach((tx, index) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
        // Repeat Header on new page
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(31, 41, 55);
        doc.rect(15, yPosition, pageWidth - 30, 9, 'F');
        doc.setTextColor(255, 255, 255);
        let currX = 15;
        headers.forEach((header, i) => {
          const align = i === 5 ? 'right' : 'left';
          const drawX = align === 'right' ? currX + columnWidths[i] - 2 : currX + 2;
          doc.text(header, drawX, yPosition + 6, { align });
          currX += columnWidths[i];
        });
        yPosition += 9;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(55, 65, 81);
      }

      const row = [
        String(index + 1),
        formatDate(tx.date),
        tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        tx.description,
        tx.type === 'income' ? (tx.source || '-') : (tx.category || '-'),
        formatCurrency(tx.amount),
      ];

      // Zebra striping
      if (index % 2 === 1) {
        doc.setFillColor(249, 250, 251);
        doc.rect(15, yPosition, pageWidth - 30, 7, 'F');
      }

      xPosition = 15;
      row.forEach((cell, i) => {
        const align = i === 5 ? 'right' : 'left';
        const drawX = align === 'right' ? xPosition + columnWidths[i] - 2 : xPosition + 2;
        doc.text(cell, drawX, yPosition + 5, { maxWidth: columnWidths[i] - 2, align });
        xPosition += columnWidths[i];
      });
      yPosition += 7;
    });

    // =========================================================================
    // PAGE 2: LAPORAN IURAN ANGGOTA
    // =========================================================================
    doc.addPage();
    yPosition = 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text('II. STATUS IURAN & KAS ANGGOTA', 15, yPosition);
    yPosition += 6;

    // Table Header for Members
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(31, 41, 55);
    doc.rect(15, yPosition, pageWidth - 30, 9, 'F');

    const memberColWidths = [12, 58, 30, 80]; // total 180
    const memberHeaders = ['No', 'Nama Anggota', 'Total Terbayar', 'Keterangan Pembayaran'];

    xPosition = 15;
    memberHeaders.forEach((h, i) => {
      const align = i === 2 ? 'right' : 'left';
      const drawX = align === 'right' ? xPosition + memberColWidths[i] - 2 : xPosition + 2;
      doc.text(h, drawX, yPosition + 6, { align });
      xPosition += memberColWidths[i];
    });
    yPosition += 9;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(55, 65, 81);

    memberStats.forEach((m, idx) => {
      if (yPosition > pageHeight - 25) {
        doc.addPage();
        yPosition = 20;
        // Repeat Header
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(31, 41, 55);
        doc.rect(15, yPosition, pageWidth - 30, 9, 'F');
        doc.setTextColor(255, 255, 255);
        let currX = 15;
        memberHeaders.forEach((h, i) => {
          const align = i === 2 ? 'right' : 'left';
          const drawX = align === 'right' ? currX + memberColWidths[i] - 2 : currX + 2;
          doc.text(h, drawX, yPosition + 6, { align });
          currX += memberColWidths[i];
        });
        yPosition += 9;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(55, 65, 81);
      }

      // Calculate Payment Keterangan
      const totalDates = availableDates.length;
      let paidCount = 0;
      const unpaidFormattedDates: string[] = [];

      availableDates.forEach(date => {
        if (m.paymentsByDate[date] && m.paymentsByDate[date] > 0) {
          paidCount++;
        } else {
          const dObj = new Date(date);
          unpaidFormattedDates.push(`${dObj.getDate()}/${dObj.getMonth() + 1}`);
        }
      });

      let keterangan = '';
      if (totalDates === 0) {
        keterangan = 'Belum ada jadwal iuran';
      } else if (paidCount === totalDates) {
        keterangan = 'Lunas (Semua Iuran)';
      } else {
        keterangan = `Lunas ${paidCount}/${totalDates}. Belum: ${unpaidFormattedDates.join(', ')}`;
      }

      const row = [
        String(m.no),
        m.name,
        formatCurrency(m.totalPaid),
        keterangan
      ];

      // Zebra striping
      if (idx % 2 === 1) {
        doc.setFillColor(249, 250, 251);
        doc.rect(15, yPosition, pageWidth - 30, 7, 'F');
      }

      xPosition = 15;
      row.forEach((cell, i) => {
        const align = i === 2 ? 'right' : 'left';
        const drawX = align === 'right' ? xPosition + memberColWidths[i] - 2 : xPosition + 2;
        doc.text(cell, drawX, yPosition + 5, { maxWidth: memberColWidths[i] - 2, align });
        xPosition += memberColWidths[i];
      });
      yPosition += 7;
    });

    // Save and Trigger Download
    const pdfBlob = doc.output('blob');
    const today = new Date();
    const dateString = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
    const filename = `Laporan_Kas_Kelas_${dateString}.pdf`;
    
    downloadFile(pdfBlob, filename);
  };

  const handleExportExcel = () => {
    const { availableDates, memberStats } = getMemberStats();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Kas Kelas');

    // Gridlines configuration
    worksheet.views = [{ showGridLines: true }];

    // Styling constants
    const borderThin = {
      top: { style: 'thin' as const, color: { argb: 'D1D5DB' } },
      left: { style: 'thin' as const, color: { argb: 'D1D5DB' } },
      bottom: { style: 'thin' as const, color: { argb: 'D1D5DB' } },
      right: { style: 'thin' as const, color: { argb: 'D1D5DB' } }
    };

    const headerFill = {
      type: 'pattern' as const,
      pattern: 'solid' as const,
      fgColor: { argb: '1F2937' } // Gray-800
    };

    const headerFont = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFF' } };
    const titleFont = { name: 'Arial', size: 12, bold: true, color: { argb: '111827' } };
    const defaultFont = { name: 'Arial', size: 9 };

    // 1. HEADER DOKUMEN
    worksheet.addRow(['LAPORAN KEUANGAN KAS KELAS LENGKAP']);
    worksheet.getCell('A1').font = { name: 'Arial', size: 14, bold: true };
    
    worksheet.addRow([`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`]);
    worksheet.getCell('A2').font = { name: 'Arial', size: 10, italic: true };
    worksheet.addRow([]); // Baris kosong

    // 2. TABEL RINGKASAN
    const rTitleRow = worksheet.addRow(['I. RINGKASAN KAS KELAS']);
    worksheet.getCell(`A${rTitleRow.number}`).font = titleFont;
    
    const rHeaderRow = worksheet.addRow(['Kategori Ringkasan', 'Jumlah Keuangan']);
    rHeaderRow.getCell(1).font = headerFont;
    rHeaderRow.getCell(1).fill = headerFill;
    rHeaderRow.getCell(1).border = borderThin;
    rHeaderRow.getCell(2).font = headerFont;
    rHeaderRow.getCell(2).fill = headerFill;
    rHeaderRow.getCell(2).border = borderThin;
    rHeaderRow.getCell(2).alignment = { horizontal: 'right' };

    const summaryData = [
      ['Saldo Kas Saat Ini', stats.totalSaldo],
      ['Total Uang Pemasukan', stats.totalPemasukan],
      ['Total Uang Pengeluaran', stats.totalPengeluaran],
      ['Total Jumlah Transaksi', stats.jumlahTransaksi],
      ['Total Anggota Terdaftar', members.length]
    ];

    summaryData.forEach(([label, value]) => {
      const row = worksheet.addRow([label, value]);
      row.getCell(1).font = defaultFont;
      row.getCell(1).border = borderThin;
      row.getCell(2).font = defaultFont;
      row.getCell(2).border = borderThin;
      if (typeof value === 'number') {
        if (label.toString().includes('Transaksi') || label.toString().includes('Anggota')) {
          row.getCell(2).numFmt = '#,##0';
        } else {
          row.getCell(2).numFmt = '"Rp"#,##0';
        }
        row.getCell(2).alignment = { horizontal: 'right' };
      }
    });

    worksheet.addRow([]); // Baris kosong
    worksheet.addRow([]); // Baris kosong

    // 3. TABEL TRANSAKSI
    const tTitleRow = worksheet.addRow(['II. RIWAYAT TRANSAKSI KAS KELAS']);
    worksheet.getCell(`A${tTitleRow.number}`).font = titleFont;

    const tHeader = worksheet.addRow(['No', 'Tanggal', 'Tipe Transaksi', 'Deskripsi', 'Kategori/Sumber', 'Jumlah (Rupiah)']);
    tHeader.eachCell((cell) => {
      cell.font = headerFont;
      cell.fill = headerFill;
      cell.border = borderThin;
      if (cell.value === 'Jumlah (Rupiah)') {
        cell.alignment = { horizontal: 'right' };
      }
    });

    transactions.forEach((tx, idx) => {
      const row = worksheet.addRow([
        idx + 1,
        formatDate(tx.date),
        tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        tx.description,
        tx.type === 'income' ? (tx.source || '-') : (tx.category || '-'),
        tx.amount
      ]);
      row.eachCell((cell, colIdx) => {
        cell.font = defaultFont;
        cell.border = borderThin;
        if (colIdx === 1) {
          cell.alignment = { horizontal: 'center' };
        }
        if (colIdx === 6) {
          cell.numFmt = '"Rp"#,##0';
          cell.alignment = { horizontal: 'right' };
        }
      });
    });

    worksheet.addRow([]); // Baris kosong
    worksheet.addRow([]); // Baris kosong

    // 4. TABEL IURAN ANGGOTA
    const iTitleRow = worksheet.addRow(['III. MATRIKS IURAN KAS ANGGOTA LENGKAP']);
    worksheet.getCell(`A${iTitleRow.number}`).font = titleFont;

    const iHeader = worksheet.addRow([
      'No', 
      'Nama Anggota', 
      'Total Kas Terbayar', 
      ...availableDates.map(date => formatDate(date))
    ]);
    iHeader.eachCell((cell, colIdx) => {
      cell.font = headerFont;
      cell.fill = headerFill;
      cell.border = borderThin;
      if (colIdx >= 3) {
        cell.alignment = { horizontal: 'right' };
      }
    });

    memberStats.forEach((m) => {
      const rowData = [
        m.no,
        m.name,
        m.totalPaid,
        ...availableDates.map(date => {
          const amount = m.paymentsByDate[date];
          return amount && amount > 0 ? amount : '-';
        })
      ];
      const row = worksheet.addRow(rowData);
      row.eachCell((cell, colIdx) => {
        cell.font = defaultFont;
        cell.border = borderThin;
        if (colIdx === 1) {
          cell.alignment = { horizontal: 'center' };
        }
        if (colIdx === 3) {
          cell.numFmt = '"Rp"#,##0';
          cell.alignment = { horizontal: 'right' };
        }
        if (colIdx >= 4) {
          if (typeof cell.value === 'number') {
            cell.numFmt = '"Rp"#,##0';
            cell.alignment = { horizontal: 'right' };
          } else {
            cell.alignment = { horizontal: 'center' };
          }
        }
      });
    });

    // Column widths setup
    const numCols = Math.max(6, 3 + availableDates.length);
    const cols = [];
    for (let i = 0; i < numCols; i++) {
      if (i === 0) cols.push({ width: 6 });       // No
      else if (i === 1) cols.push({ width: 30 });  // Tanggal / Nama Anggota
      else if (i === 2) cols.push({ width: 22 });  // Tipe / Total Terbayar
      else if (i === 3) cols.push({ width: 40 });  // Deskripsi / Tanggal Iuran 1
      else if (i === 4) cols.push({ width: 25 });  // Kategori / Tanggal Iuran 2
      else if (i === 5) cols.push({ width: 18 });  // Jumlah / Tanggal Iuran 3
      else cols.push({ width: 15 });               // Tanggal Iuran 4 dst.
    }
    worksheet.columns = cols;

    // Generate and download XLSX buffer
    const today = new Date();
    const dateString = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
    const filename = `Laporan_Kas_Kelas_${dateString}.xlsx`;

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      downloadFile(blob, filename);
    });
  };

  return (
    <div className="bg-surface-card rounded-lg p-4 sm:p-6 border border-hairline">
      <h3 className="text-lg font-semibold text-content mb-4">Export Laporan</h3>
      
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
