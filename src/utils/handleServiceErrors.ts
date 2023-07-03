export const handleServiceErrors = (err: any) => {
  if (typeof err === 'string') {
    throw new Error(err);
  }

  if (typeof err === 'object' && 'message' in err) {
    throw new Error(err.message);
  }

  throw new Error('Unexpected exception');
};
