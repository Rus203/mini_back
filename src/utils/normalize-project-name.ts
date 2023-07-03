export const normalizeProjectName = (name: string) => {
  const intermediate = name.toLowerCase().split(' ');
  return [...intermediate, Date.now(), Math.random() * 1000].join('-');
};
