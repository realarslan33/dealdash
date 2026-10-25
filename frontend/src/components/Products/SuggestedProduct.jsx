import React, { useEffect, useState } from 'react'
import { useSelector } from "react-redux";
import styles from "../../styles/styles";
import ProductCard from "../Route/ProductCard/ProductCard"

const SuggestedProduct = ({ data }) => {
    const { allProducts } = useSelector((state) => state.products);
    const [productData, setProductData] = useState([]);

    // Product is filtered when category matches the current product and is not the current product
    useEffect(() => {
        const d =
            allProducts &&
            allProducts.filter(
                (i) => i.category === data?.category && i._id !== data?._id
            );
        setProductData(d || []);
    }, [allProducts, data]);

    return (
        <div>
            {
                data && productData && productData.length !== 0 ? (
                    <div
                        className={`p-4 ${styles.section}`}>
                        <h2
                            className={`${styles.heading} text-[25px] font-[500] border-b mb-5`}
                        >
                            Related Products
                        </h2>
                        <div className={styles.productGrid}>
                            {
                                productData.map((i, index) => (
                                    <ProductCard data={i} key={i._id || index} />
                                ))
                            }
                        </div>
                    </div>
                ) : null
            }
        </div>
    )
}

export default SuggestedProduct
