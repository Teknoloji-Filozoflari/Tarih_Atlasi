import { incomingView } from './view';
export function useIncomingView(params: Record<string, unknown>, maxYear: number) {
  return incomingView(params, maxYear);
}
