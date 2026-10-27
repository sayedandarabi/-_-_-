import AsyncStorage from "@react-native-async-storage/async-storage";
import { seedState, type LedgerState } from "./domain";

const LEDGER_STORAGE_KEY = "afgledger:ledger:v1";

function cloneSeed(): LedgerState {
  return JSON.parse(JSON.stringify(seedState)) as LedgerState;
}

export async function loadLedgerState(): Promise<LedgerState> {
  try {
    const raw = await AsyncStorage.getItem(LEDGER_STORAGE_KEY);
    if (!raw) return cloneSeed();
    const parsed = JSON.parse(raw) as LedgerState;
    if (!parsed.transactions || !parsed.parties || !parsed.outbox)
      return cloneSeed();
    return parsed;
  } catch {
    return cloneSeed();
  }
}

export async function saveLedgerState(state: LedgerState) {
  await AsyncStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(state));
}

export async function resetLedgerState() {
  await AsyncStorage.removeItem(LEDGER_STORAGE_KEY);
  return cloneSeed();
}
