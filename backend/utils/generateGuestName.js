const generateGuestName = () => {
  return `Guest-${Math.floor(Math.random() * 1000)}`;
};

export default generateGuestName;