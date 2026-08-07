import { Member } from '@/types';

export const members: Member[] = [
  { id: '1', name: 'ADELIA MIRANTI' },
  { id: '2', name: 'AHMAD FAUZI R.' },
  { id: '3', name: 'AMANDA RIFA A.' },
  { id: '4', name: 'AMI ARIANTI' },
  { id: '5', name: 'ANGGA HANDIKA P.' },
  { id: '6', name: 'ANGGREINA RAMADHANI' },
  { id: '7', name: 'ANNISA SYAQINAH' },
  { id: '8', name: 'ANISA PUTRI N.' },
  { id: '9', name: 'AULIA FAARA F.' },
  { id: '10', name: 'AULIA RAHMA DITA' },
  { id: '11', name: 'AYU RIFA KHASANAH' },
  { id: '12', name: 'AYUNDA ENJELINA' },
  { id: '13', name: 'DEVILA ANITA SARI' },
  { id: '14', name: 'DHIYAUDDIN EL ZACKY' },
  { id: '15', name: 'DINDA RAMADANI N.Z' },
  { id: '16', name: 'EDELWEISS R.' },
  { id: '17', name: 'EFRIKA KUMALASARI.E' },
  { id: '18', name: 'FAIZA SUCI N.H' },
  { id: '19', name: 'GALUH INAYAH P.' },
  { id: '20', name: 'INDRI KAMILIYA H.' },
  { id: '21', name: 'INE INNAIYA' },
  { id: '22', name: 'KAHAYA AINI S.' },
  { id: '23', name: 'KAYLA RAFISHA N.R.' },
  { id: '24', name: 'KIRANA ANANTA' },
  { id: '25', name: 'MAIA PUTRI ZHARIFA' },
  { id: '26', name: 'MARISA FRANSISKA' },
  { id: '27', name: 'MUSA RAHMAN A.I.A' },
  { id: '28', name: 'NADHIRA NAFISA Z.' },
  { id: '29', name: 'NADIA RIZKY R.' },
  { id: '30', name: 'NAILA ANISA S.' },
  { id: '31', name: 'NASYWA SINDI A.' },
  { id: '32', name: 'NISMA AUFA SHIFA' },
  { id: '33', name: 'NOVA ERLIANTI' },
  { id: '34', name: 'QAWULAN TSAQILA' },
  { id: '35', name: 'RECKSA JA\'KPARHAN R.' },
  { id: '36', name: 'SALMA ZAHRANI' },
  { id: '37', name: 'SALSABILA OCTAVIANI D.' },
  { id: '38', name: 'SALSA RAHMADHANI' },
  { id: '39', name: 'SEPTIA KHAIRANI' },
  { id: '40', name: 'SILVIA RISMA PUTRI' },
  { id: '41', name: 'SITI NAYA SYAHIRA' },
  { id: '42', name: 'TAFFIDAH DWI ZULFA' },
  { id: '43', name: 'VANIA ARDIANTI IQBAL' },
  { id: '44', name: 'YULIA WULANDARI' },
  { id: '45', name: 'ZAQIA ALIFIA MAFULI' },
  { id: '46', name: 'ZAHARA NURFATIN' },
  { id: '47', name: 'ZANETA DEWARI' },
  { id: '48', name: 'ZULVIANAN ADHWAA R.' },
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(dateStr: string, createdAt?: number | any): string {
  const date = new Date(dateStr);
  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);

  if (!createdAt) return formattedDate;

  let timeMs = 0;
  if (typeof createdAt === 'number') {
    timeMs = createdAt;
  } else if (createdAt && typeof createdAt.toMillis === 'function') {
    timeMs = createdAt.toMillis();
  } else if (createdAt && createdAt.seconds) {
    timeMs = createdAt.seconds * 1000;
  }

  if (!timeMs) return formattedDate;

  const timeObj = new Date(timeMs);
  const formattedTime = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(timeObj);

  return `${formattedDate}, ${formattedTime}`;
}

export function generateId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}
