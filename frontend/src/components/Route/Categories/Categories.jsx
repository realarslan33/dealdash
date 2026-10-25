import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { brandingData, categoriesData } from "../../../static/data";
import styles from "../../../styles/styles";

const Categories = () => {
  const navigate = useNavigate();
  const { allProducts } = useSelector((state) => state.products);

  return (
    <>
      <div className="mx-auto my-12 hidden w-11/12 rounded-md bg-white p-5 shadow-sm sm:block">
        <div className="flex w-full justify-between">
          {brandingData.map((item, index) => (
            <div className="flex items-start" key={index}>
              {item.icon}
              <div className="px-3">
                <h3 className="text-sm font-bold md:text-base">{item.title}</h3>
                <p className="text-xs md:text-sm">{item.Description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className={`${styles.section} mt-8 mb-12 sm:mt-0`} id="categories">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {categoriesData.map((category) => {
            const itemCount = Array.isArray(allProducts)
              ? allProducts.filter((product) => product.category === category.title).length
              : null;

            return (
              <button
                className="flex h-[175px] w-full flex-col items-center justify-center gap-1 rounded-[4px] border border-[#d4dee8] bg-white px-2 text-center transition-colors hover:border-[#9aafc7]"
                key={category.id}
                onClick={() => {
                  navigate(`/products?category=${encodeURIComponent(category.title)}`)
                }}
                type="button"
              >
                <img
                  src={category.image_Url}
                  className="h-[88px] w-[100px] object-contain"
                  alt=""
                />
                <span className="mt-1 text-[16px] font-semibold leading-5 text-[#405d91]">
                  {category.title}
                </span>
                <span className="text-[14px] leading-5 text-[#8a9dc2]">
                  {itemCount === null
                    ? "Loading items"
                    : `${itemCount} ${itemCount === 1 ? "item" : "items"}`}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
};

export default Categories;
