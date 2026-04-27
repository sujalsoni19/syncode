function getGuestId() {
  let guestId = localStorage.getItem("guestId");

  if (!guestId) {
    guestId = "guest_" + crypto.randomUUID();
    localStorage.setItem("guestId", guestId);
  }

  return guestId;
}

export default getGuestId;