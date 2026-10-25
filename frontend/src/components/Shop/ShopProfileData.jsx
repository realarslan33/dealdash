import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { getAllProductsShop } from "../../redux/actions/product";
import styles from "../../styles/styles";
import ProductCard from "../Route/ProductCard/ProductCard";
import ShopProductCard from "./ShopProductCard";
import { backend_url } from "../../server";
import Ratings from "../Products/Ratings";
import { getAllEventsShop } from "../../redux/actions/event";
import { CgProfile } from "react-icons/cg";

const ShopProfileData = ({ isOwner }) => {
  const { products } = useSelector((state) => state.products);
  const { events } = useSelector((state) => state.events);
  const { id } = useParams();

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAllEventsShop(id));
    dispatch(getAllProductsShop(id));
  }, [dispatch, id]);

  const [active, setActive] = useState(1);

  const allReviews =
    products && products.map((product) => product.reviews).flat();

  return (
    <div className="w-full">
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav
          aria-label="Shop information"
          className="flex min-w-0 max-w-full flex-1 gap-1 overflow-x-auto border-b border-[#dce4f1]"
        >
          {[
            { id: 1, label: `Shop Products (${products ? products.length : 0})` },
            { id: 2, label: `Running Events (${events ? events.length : 0})` },
            { id: 3, label: `Shop Reviews (${allReviews ? allReviews.length : 0})` },
          ].map((tab) => (
            <button
              aria-pressed={active === tab.id}
              className={`shrink-0 border-b-2 px-3 py-3 text-sm font-semibold transition-colors sm:px-4 ${
                active === tab.id
                  ? "border-[#3957db] text-[#3957db]"
                  : "border-transparent text-[#7183a3] hover:text-[#405d91]"
              }`}
              key={tab.id}
              onClick={() => setActive(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </nav>
        {isOwner && (
          <div className="shrink-0 self-start sm:self-center">
            <div className="flex items-center gap-2">
              {active === 1 && (
                <Link to="/dashboard-create-product" className="shrink-0">
                  <div className="flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-md bg-[#3957db] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2f49b7]">
                    <span className="whitespace-nowrap">+ Add Product</span>
                  </div>
                </Link>
              )}
              {active === 2 && (
                <Link to="/dashboard-create-event" className="shrink-0">
                  <div className="flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-md bg-[#3957db] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2f49b7]">
                    <span className="whitespace-nowrap">+ Add Event</span>
                  </div>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      <br />

      {active === 1 && (
        <div className="w-full">
          {products && products.length > 0 ? (
            <div className={styles.productGrid}>
              {products.map((i, index) =>
                isOwner ? (
                  <ShopProductCard data={i} key={index} />
                ) : (
                  <ProductCard data={i} key={index} />
                )
              )}
            </div>
          ) : (
            <div className="w-full rounded-lg border border-dashed border-[#dce4f1] bg-[#f7f9fc] py-12 text-center">
              <h5 className="text-sm font-medium text-[#7183a3]">
                {isOwner
                  ? "You have not added any products to your shop yet."
                  : "No products available for this shop right now."}
              </h5>
              {isOwner && (
                <Link
                  to="/dashboard-create-product"
                  className="mt-3 inline-block rounded-md bg-[#3957db] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#2f49b7]"
                >
                  Create Your First Product
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {active === 2 && (
        <div className="w-full">
          {events && events.length > 0 ? (
            <div className={styles.productGrid}>
              {events.map((i, index) =>
                isOwner ? (
                  <ShopProductCard data={i} key={index} isEvent={true} />
                ) : (
                  <ProductCard data={i} key={index} isEvent={true} />
                )
              )}
            </div>
          ) : (
            <div className="w-full rounded-lg border border-dashed border-[#dce4f1] bg-[#f7f9fc] py-12 text-center">
              <h5 className="text-sm font-medium text-[#7183a3]">
                {isOwner
                  ? "You have no active running events."
                  : "No running events found for this shop."}
              </h5>
              {isOwner && (
                <Link
                  to="/dashboard-create-event"
                  className="mt-3 inline-block rounded-md bg-[#3957db] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#2f49b7]"
                >
                  Create an Event
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {/* Shop reviews */}
      {active === 3 && (
        <div className="w-full">
          {allReviews &&
            allReviews.map((item, index) => (
              <div
                key={`${item.user?._id || "review"}-${item.createdAt || index}-${index}`}
                className="my-4 flex w-full gap-3 rounded-lg border border-[#dce4f1] bg-[#f7f9fc] p-4"
              >
                {item.user?.avatar ? (
                  <img
                    src={`${backend_url}${item.user.avatar}`}
                    className="h-12 w-12 shrink-0 rounded-full border border-[#dce4f1] object-cover"
                    alt=""
                  />
                ) : (
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#dce4f1] bg-[#eef2ff] text-[#8a9dc2]"
                    aria-hidden="true"
                  >
                    <CgProfile className="text-2xl" />
                  </span>
                )}
                <div className="min-w-0">
                  <div className="flex w-full items-center">
                    <h1 className="pr-2 font-semibold text-[#405d91]">
                      {item.user?.name || "Customer"}
                    </h1>
                    <Ratings rating={item.rating} />
                  </div>
                  <p className="mt-1 text-sm leading-6 text-[#526b99]">
                    {item?.comment}
                  </p>
                  <p className="mt-2 text-xs text-[#8a9dc2]">
                    {item.createdAt ? item.createdAt.substring(0, 10) : ""}
                  </p>
                </div>
              </div>
            ))}
          {allReviews && allReviews.length === 0 && (
            <h5 className="w-full rounded-lg border border-dashed border-[#dce4f1] bg-[#f7f9fc] py-10 text-center text-sm text-[#7183a3]">
              No reviews yet for this shop.
            </h5>
          )}
        </div>
      )}
    </div>
  );
};

export default ShopProfileData;
