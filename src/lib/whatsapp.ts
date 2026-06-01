/**
 * WhatsApp Link Service (Direct to App/Web)
 * Menggunakan wa.me link agar user bisa mengirim pesan langsung dari laptop/HP mereka.
 */

export interface WhatsAppPayload {
  target: string; // Nomor HP (08xxxx atau 628xxxx)
  message: string;
}

export const getWhatsAppUrl = (payload: WhatsAppPayload): string => {
  // Bersihkan nomor telepon (hapus +, -, spasi, dll)
  let phone = payload.target.replace(/[^0-9]/g, "");

  // normalisasi ke format internasional (62)
  if (phone.startsWith("0")) {
    phone = "62" + phone.slice(1);
  } else if (!phone.startsWith("62")) {
    phone = "62" + phone;
  }

  const encodedMessage = encodeURIComponent(payload.message);
  return `https://wa.me/${phone}?text=${encodedMessage}`;
};

/**
 * sendWhatsApp compatible wrapper
 * Sekarang mengembalikan objek sukses yang berisi URL.
 * UI harus menangani pembukaan URL ini (window.open).
 */
export const sendWhatsApp = async (payload: WhatsAppPayload) => {
  const url = getWhatsAppUrl(payload);
  return { 
    success: true, 
    url, 
    message: "Link WhatsApp Berhasil Dibuat" 
  };
};
