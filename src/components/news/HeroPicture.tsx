import { getImageProps } from "next/image";

/**
 * Post hero art direction: the square cover on phones (portrait screens) and the landscape
 * cover from 640px, in one <picture> so only one of them downloads.
 */
export function HeroPicture({ square, wide, alt }: { square: string; wide?: string; alt: string }) {
  const cls = "object-cover object-center";
  // Inline sizing: the global `img { height: auto }` rule would otherwise beat the utilities.
  const fill = { position: "absolute", inset: 0, width: "100%", height: "100%" } as const;
  const local = square.startsWith("/") && (!wide || wide.startsWith("/"));
  if (!local) {
    return (
      <picture>
        {wide && <source media="(min-width: 640px)" srcSet={wide} />}
        <img src={square} alt={alt} fetchPriority="high" className={cls} style={fill} />
      </picture>
    );
  }
  const common = { alt, sizes: "100vw", quality: 75 } as const;
  const {
    props: { srcSet: mobile, ...rest },
  } = getImageProps({ ...common, src: square, width: 1440, height: 1440, priority: true });
  const desktop = wide ? getImageProps({ ...common, src: wide, width: 1600, height: 1000, priority: true }).props.srcSet : undefined;
  return (
    <picture>
      {desktop && <source media="(min-width: 640px)" srcSet={desktop} sizes="100vw" />}
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt is in rest */}
      <img {...rest} srcSet={mobile} className={cls} style={fill} />
    </picture>
  );
}
