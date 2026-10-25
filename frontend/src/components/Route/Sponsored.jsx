import React from "react";
import styles from "../../styles/styles";

const sponsoredBrands = [
  {
    name: "Sony",
    logo: "https://logos-world.net/wp-content/uploads/2020/04/Sony-Logo.png",
  },
  {
    name: "Dell",
    logo: `${process.env.PUBLIC_URL}/brand-logos/dell-ar21~bgwhite.svg`,
  },
  { name: "LG", logo: `${process.env.PUBLIC_URL}/brand-logos/lg-icon.svg` },
  {
    name: "Apple",
    logo: `${process.env.PUBLIC_URL}/brand-logos/apple-icon.svg`,
  },
  {
    name: "Microsoft",
    logo: `${process.env.PUBLIC_URL}/brand-logos/microsoft-icon.svg`,
  },
  {
    name: "O'Reilly",
    logo: `${process.env.PUBLIC_URL}/brand-logos/oreilly-ar21~bgwhite.svg`,
  },
];

const Sponsored = () => (
  <section
    aria-label="Featured brands"
    className={`${styles.section} mb-12 hidden rounded-xl bg-white px-5 py-10 sm:block`}
  >
    <div className="grid grid-cols-3 items-center justify-items-center gap-8 md:grid-cols-6">
      {sponsoredBrands.map(({ name, logo }) => (
        <img
          key={name}
          alt={name}
          className="h-12 w-full max-w-[150px] object-contain"
          src={logo}
        />
      ))}
    </div>
  </section>
);

export default Sponsored;
