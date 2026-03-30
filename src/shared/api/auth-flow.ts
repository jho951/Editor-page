/**
 * 인증 콜백 교환 흐름 중 자동 인증 호출을 제어하는 유틸입니다.
 */

const EXCHANGE_DONE_KEY = "auth_exchange_done";

function getCallbackTicketFromLocation(): string | null {
  if (typeof window === "undefined") return null;
  if (window.location.pathname !== "/auth/callback") return null;
  return new URLSearchParams(window.location.search).get("ticket");
}

export function markExchangeTicketSucceeded(ticket: string): void {
  if (typeof window === "undefined") return;
  if (!ticket) return;
  try {
    window.sessionStorage.setItem(EXCHANGE_DONE_KEY, ticket);
  } catch {
    // ignore storage failures
  }
}

export function shouldBlockAutoAuthBeforeExchange(): boolean {
  if (typeof window === "undefined") return false;
  const callbackTicket = getCallbackTicketFromLocation();
  if (!callbackTicket) return false;

  try {
    const successTicket = window.sessionStorage.getItem(EXCHANGE_DONE_KEY);
    return successTicket !== callbackTicket;
  } catch {
    return false;
  }
}
