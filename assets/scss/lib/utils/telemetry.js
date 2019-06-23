
export let instanceCount = 0;

export function incrementInstanceCount() {
  instanceCount++;
}

export const registrations = [];

function _regLog(prototype) {
  console.log('[' + (prototype).is + ']: registered');
}

export function register(prototype) {
  registrations.push(prototype);
}

export function dumpRegistrations() {
  registrations.forEach(_regLog);
}