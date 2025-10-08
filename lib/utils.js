// lib/utils.js

/**
 * Verilen resim URL dizisinden geçerli ve güvenli bir URL döndürür.
 * Dizi boşsa veya ilk öğe geçerli bir URL değilse, varsayılan bir yer tutucu resim döndürür.
 * @param {string[] | undefined | null} urls - Resim URL'lerinin bir dizisi.
 * @param {number} [index=0] - Döndürülecek URL'nin dizideki indeksi.
 * @returns {string} Geçerli bir resim URL'si.
 */
export const getSafeImageUrl = (urls, index = 0) => {
  if (Array.isArray(urls) && urls[index] && typeof urls[index] === 'string' && urls[index].trim() !== '') {
    return urls[index];
  }
  return '/assets/placeholder.jpg'; // Varsayılan yer tutucu resim
};
