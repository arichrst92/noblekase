/**
 * SmartImage — pembungkus next/image yang melewati optimizer untuk file SVG.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Alasan: SVG sudah berupa vektor (kecil) dan tidak mendapat manfaat dari
 * optimizer Next. Melewatkannya juga menghindari error 500 pada optimizer
 * saat SVG disajikan lewat route media Payload.
 */

import NextImage, { type ImageProps } from "next/image";

export function SmartImage(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  const isSvg = src.toLowerCase().split("?")[0].endsWith(".svg") || src.includes(".svg");
  return <NextImage {...props} unoptimized={props.unoptimized ?? isSvg} />;
}

export default SmartImage;
