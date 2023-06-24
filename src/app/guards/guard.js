// teaserSagas.js (client-side)

import { call, takeEvery, takeLatest } from "redux-saga/effects";
import { LOCATION_CHANGE } from "react-router-redux";
import { TEASER_LOCK_ENTER, TEASER_LOCK_LEAVE } from "./teaserLock";

// Some other import...

// On location change, attempt to retrieve teaserId from the current url
// Does nothing if the current url has no teaserId
// Send "TEASER_LOCK_ENTER" to the socket with the teaserId and a Promise resolve as callback
// The socket server will send back to us the locked status of the teaserId
// If the teaser is locked, redirect to index and show a forbidden notification
export function* watchForTeaserLockEnter({ payload }) {
  const teaserId = getTeaserIdFromPath(payload.pathname);

  if (!teaserId) {
    return;
  }

  const isTeaserLocked = yield call(
    () =>
      new Promise(resolve => {
        clientSocket.emit(TEASER_LOCK_ENTER, { teaserId }, resolve);
      })
  );

  if (isTeaserLocked) {
    yield put(redirectToTeasersIndex);
    yield put(showTeaserLockedNotification);
  }
}

// On location change, attempt to retrieve teaserId from the previous url
// Send "TEASER_LOCK_LEAVE" to the socket if the previous url is a teaser
export function* watchForTeaserLockLeave() {
  const previousTeaserId = getTeaserIdFromPath(
    yield getPreviousBrowserHistoryPath()
  );

  if (previousTeaserId) {
    clientSocket.emit(TEASER_LOCK_LEAVE, { teaserId: previousTeaserId });
  }
}

// Register "watchers" on route change for router enter and route leave
export default function* root() {
  yield [
    takeEvery(LOCATION_CHANGE, watchForTeaserLockEnter),
    takeEvery(LOCATION_CHANGE, watchForTeaserLockLeave),
  ];
}
