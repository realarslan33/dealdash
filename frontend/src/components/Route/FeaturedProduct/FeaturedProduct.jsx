import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import styles from "../../../styles/styles";
import ProductCard from "../ProductCard/ProductCard";

const FeaturedProduct = () => {
  const { allProducts } = useSelector((state) => state.products);
  const featuredProducts = useMemo(
    () =>
      [...(allProducts || [])]
        .sort((productA, productB) => {
          const createdAtA = new Date(productA.createdAt).getTime();
          const createdAtB = new Date(productB.createdAt).getTime();
          const createdAtDifference =
            (Number.isFinite(createdAtB) ? createdAtB : 0) -
            (Number.isFinite(createdAtA) ? createdAtA : 0);

          if (createdAtDifference) return createdAtDifference;

          const idTimestamp = (id) => {
            const objectId = String(id || "");
            return /^[\da-f]{24}$/i.test(objectId)
              ? parseInt(objectId.slice(0, 8), 16) * 1000
              : 0;
          };

          return idTimestamp(productB._id) - idTimestamp(productA._id);
        })
        .slice(0, 10),
    [allProducts]
  );

  return (
    <div>
      <div className={`${styles.section}`}>
        <div className={`${styles.heading}`}>
          <h1>Featured Products</h1>
        </div>
        <div className={styles.productGrid}>
          {featuredProducts.length > 0 && (
            <>
              {featuredProducts.map((product) => (
                <ProductCard data={product} key={product._id} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeaturedProduct;
