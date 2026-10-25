import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import styles from "../../../styles/styles";
import ProductCard from "../ProductCard/ProductCard";

const BestDeals = () => {
  const { allProducts } = useSelector((state) => state.products);
  const data = useMemo(
    () =>
      [...(allProducts || [])]
        .sort(
          (a, b) =>
            Math.max(0, Number(b.sold_out) || 0) -
            Math.max(0, Number(a.sold_out) || 0)
        )
        .slice(0, 5),
    [allProducts]
  );

  return (
    <div>
      <div className={`${styles.section}`}>
        <div className={`${styles.heading}`}>
          <h1>Best Deals</h1>
        </div>
        <div className={styles.productGrid}>
          {data && data.length !== 0 && (
            <>
              {data &&
                data.map((i, index) => (
                  <ProductCard
                    data={i}
                    key={index}
                  />
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BestDeals;
