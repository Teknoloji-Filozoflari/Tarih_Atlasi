/** Reviewed source snapshots. Changing these requires editorial review, never automatic collection. */
export const reviewedPeopleInputs = Object.freeze({
  browserReview: '1ef2f30733182213807b6065eb68ae64d692b954224ecfe1555dc90514093811',
  decisions: '938c5f65ceee93fb1294be3c48979ffaabbb1db4826db2822cb5018cef48bcab',
});
export const reviewedExpansionInputs = Object.freeze({
  browserReview: '2503b94cf4a8966a6ba3e6c7c6f0d383d21cc42e649cc7cd9bd3007f3991bc03',
  decisions: 'fd72b13848b649364222e25b86de0bf6af8d1abcfdbf99ffd6e1d658b6ae6fa5',
});
export const reviewedOttomanInputs = Object.freeze({
  browserReview: '15935b627aa79a59a1b1f3755e5efcfb4af646dfe45505c22978dfb40a669123',
  decisions: 'c8d9c38cc91c69e317fbd7eeed9d9b5327aa766a5fddeadfade152e2d638650e',
});
export const reviewedGlobalInputs = Object.freeze({
  browserReview: 'b3203b94e9483ce20e5577e688feb6c3a6f269e66f8b0cc5019739b53709a58d',
  decisions: 'e071ca63130e3c1a5e941eb62e6cbeadbb435651e856a4acfab8927d233857a4',
});
export const reviewedBroadInputs = Object.freeze({
  browserReview: 'a767071e8d99e82faf3068ba38740fb007e72b2036b6d590d7b15a0fc663ed66',
  decisions: '4323ad3a51c18fe177536c32eb06f55eefe0b3758dabb50f1d2be24deb8433b3',
});
export function reviewedInputsFor(version: string) {
  return version === '1.0.1-births'
    ? reviewedPeopleInputs
    : version === '1.1.1-births'
      ? reviewedExpansionInputs
      : version === '1.2.0-births'
        ? reviewedOttomanInputs
        : version === '1.3.0-births'
          ? reviewedGlobalInputs
          : version === '1.4.0-births'
            ? reviewedBroadInputs
            : null;
}
