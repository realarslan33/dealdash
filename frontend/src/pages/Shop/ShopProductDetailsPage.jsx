import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ShopProductDetails from "../../components/Shop/ShopProductDetails";
import Loader from "../../components/Layout/Loader";
import { getAllProducts, getAllProductsShop } from "../../redux/actions/product";
import { getAllEvents, getAllEventsShop } from "../../redux/actions/event";

const ShopProductDetailsPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEvent = searchParams.get("isEvent") !== null;

  const { allProducts, products, isLoading: productLoading } = useSelector(
    (state) => state.products
  );
  const { allEvents, events, isLoading: eventLoading } = useSelector(
    (state) => state.events
  );
  const { seller } = useSelector((state) => state.seller);

  const [data, setData] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!allProducts || allProducts.length === 0) {
      dispatch(getAllProducts());
    }
    if (!allEvents || allEvents.length === 0) {
      dispatch(getAllEvents());
    }
    if (seller?._id) {
      dispatch(getAllProductsShop(seller._id));
      dispatch(getAllEventsShop(seller._id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, seller?._id]);

  useEffect(() => {
    let found = null;
    if (isEvent) {
      found =
        (allEvents && allEvents.find((i) => i._id === id)) ||
        (events && events.find((i) => i._id === id));
    } else {
      found =
        (allProducts && allProducts.find((i) => i._id === id)) ||
        (products && products.find((i) => i._id === id));
    }

    if (!found) {
      // Fallback: check across both lists just in case query param is missing
      found =
        (allProducts && allProducts.find((i) => i._id === id)) ||
        (products && products.find((i) => i._id === id)) ||
        (allEvents && allEvents.find((i) => i._id === id)) ||
        (events && events.find((i) => i._id === id));
    }

    setData(found || null);
  }, [id, isEvent, allProducts, products, allEvents, events]);

  const isLoading = (isEvent ? eventLoading : productLoading) && !data;

  if (isLoading || !data) {
    return <Loader />;
  }

  return <ShopProductDetails data={data} isEvent={isEvent} />;
};

export default ShopProductDetailsPage;
