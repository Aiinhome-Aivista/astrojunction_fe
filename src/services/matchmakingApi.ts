import { api, getToken } from './api';
import { API_ENDPOINTS } from '../config/api_config';
import { AshtaKootaMilanResult } from '../types';

export interface MatchReportSummary {
  id: string;
  partner1Name: string;
  partner1BirthDate: string;
  partner2Name: string;
  partner2BirthDate: string;
  totalScore: number;
  maxScore: number;
  manglikStatus: string | null;
  createdAt: string;
}

export interface MatchReportFull extends MatchReportSummary {
  report: AshtaKootaMilanResult;
}

export async function saveMatchReport(
  result: AshtaKootaMilanResult,
  p1?: any,
  p2?: any,
): Promise<MatchReportFull> {
  const p1Actual = p1 || result.partner1 || {};
  const p2Actual = p2 || result.partner2 || {};

  const p1Name = p1Actual.fullName || p1Actual.name || '';
  const p1Dob = p1Actual.birthDate || p1Actual.dob || '';
  const p1Time = p1Actual.birthTime || p1Actual.time || '';
  const p1Place = p1Actual.birthPlace || p1Actual.place || '';
  const p1Lat = typeof p1Actual.latitude === 'number' ? p1Actual.latitude : undefined;
  const p1Lon = typeof p1Actual.longitude === 'number' ? p1Actual.longitude : undefined;
  const p1Tz = p1Actual.timezone;

  const p2Name = p2Actual.fullName || p2Actual.name || '';
  const p2Dob = p2Actual.birthDate || p2Actual.dob || '';
  const p2Time = p2Actual.birthTime || p2Actual.time || '';
  const p2Place = p2Actual.birthPlace || p2Actual.place || '';
  const p2Lat = typeof p2Actual.latitude === 'number' ? p2Actual.latitude : undefined;
  const p2Lon = typeof p2Actual.longitude === 'number' ? p2Actual.longitude : undefined;
  const p2Tz = p2Actual.timezone;

  return api.post<MatchReportFull>(API_ENDPOINTS.MATCHMAKING.REPORTS, {
    partner1Name: p1Name,
    partner1BirthDate: p1Dob,
    partner1BirthTime: p1Time,
    partner1BirthPlace: p1Place,
    partner2Name: p2Name,
    partner2BirthDate: p2Dob,
    partner2BirthTime: p2Time,
    partner2BirthPlace: p2Place,
    partner1: {
      name: p1Name,
      fullName: p1Name,
      dob: p1Dob,
      birthDate: p1Dob,
      time: p1Time,
      birthTime: p1Time,
      place: p1Place,
      birthPlace: p1Place,
      latitude: p1Lat,
      longitude: p1Lon,
      timezone: p1Tz,
      gender: p1Actual.gender || 'male',
    },
    partner2: {
      name: p2Name,
      fullName: p2Name,
      dob: p2Dob,
      birthDate: p2Dob,
      time: p2Time,
      birthTime: p2Time,
      place: p2Place,
      birthPlace: p2Place,
      latitude: p2Lat,
      longitude: p2Lon,
      timezone: p2Tz,
      gender: p2Actual.gender || 'female',
    },
    totalScore: result.totalPoints ?? (result as any).totalScore ?? 0,
    maxScore: result.maxPoints ?? (result as any).maxScore ?? 36,
    manglikStatus:
      result.manglik?.partner1?.isManglik || result.manglik?.partner2?.isManglik
        ? `${result.manglik?.partner1?.severity || 'Manglik'} / ${result.manglik?.partner2?.severity || 'Manglik'}`
        : 'Non-Manglik',
    report: result,
  });
}

export async function listMatchReports(): Promise<MatchReportSummary[]> {
  return api.get<MatchReportSummary[]>(API_ENDPOINTS.MATCHMAKING.REPORTS);
}

export async function fetchMatchReport(id: string): Promise<MatchReportFull> {
  return api.get<MatchReportFull>(`${API_ENDPOINTS.MATCHMAKING.REPORTS}/${id}`);
}

export async function calculateMatchReportBackend(
  p1: any,
  p2: any,
): Promise<any | null> {
  try {
    const payload = {
      partner1: {
        name: p1?.fullName || p1?.name || '',
        dob: p1?.birthDate || p1?.dob || '',
        time: p1?.birthTime || p1?.time || '',
        place: p1?.birthPlace || p1?.place || '',
        latitude: typeof p1?.latitude === 'number' ? p1.latitude : undefined,
        longitude: typeof p1?.longitude === 'number' ? p1.longitude : undefined,
        timezone: p1?.timezone,
        gender: p1?.gender || 'male',
      },
      partner2: {
        name: p2?.fullName || p2?.name || '',
        dob: p2?.birthDate || p2?.dob || '',
        time: p2?.birthTime || p2?.time || '',
        place: p2?.birthPlace || p2?.place || '',
        latitude: typeof p2?.latitude === 'number' ? p2.latitude : undefined,
        longitude: typeof p2?.longitude === 'number' ? p2.longitude : undefined,
        timezone: p2?.timezone,
        gender: p2?.gender || 'female',
      },
    };
    
    // Call the dedicated public Swiss Ephemeris calculate endpoint
    const res = await api.post<any>(API_ENDPOINTS.MATCHMAKING.CALCULATE, payload);
    if (res && res.data) {
      return res.data;
    }
    if (res && res.report) {
      return res;
    }
    return res;
  } catch (err) {
    console.warn('Backend API matchmaking calculation call error (using client engine):', err);
  }
  return null;
}

export function getMatchReportPdfUrl(reportId: string): string {
  const token = getToken();
  const base = `${API_ENDPOINTS.MATCHMAKING.REPORTS}/${reportId}/pdf`;
  return token ? `${base}?token=${encodeURIComponent(token)}` : base;
}

export async function generateAISynthesis(payload: {
  partner1: any;
  partner2: any;
  matchResult: any;
  language?: string;
  force?: boolean;
}): Promise<any> {
  return api.post(API_ENDPOINTS.MATCHMAKING.SYNTHESIS, payload);
}

export async function downloadAISynthesisPdf(synthesisId: string, fileName: string): Promise<void> {
  return api.downloadFile(API_ENDPOINTS.MATCHMAKING.AI_SYNTHESIS_PDF(synthesisId), fileName);
}

export async function generateDirectAISynthesisPdf(payload: any, fileName: string): Promise<void> {
  return api.downloadFile(API_ENDPOINTS.MATCHMAKING.AI_SYNTHESIS_GENERATE_PDF, fileName, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function generateDirectMatchPdf(payload: any, fileName: string): Promise<void> {
  return api.downloadFile(API_ENDPOINTS.MATCHMAKING.GENERATE_PDF, fileName, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
