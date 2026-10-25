import React, { useEffect, useState } from 'react'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import ProductDetails from "../components/Products/ProductDetails";
import { useParams, useSearchParams } from 'react-router-dom';
import SuggestedProduct from "../components/Products/SuggestedProduct";
import { useSelector, useDispatch } from 'react-redux';
import { getAllProducts } from "../redux/actions/product";
import { getAllEvents } from "../redux/actions/event";

const ProductDetailsPage = () => {
    const { allProducts } = useSelector((state) => state.products);
    const { allEvents } = useSelector((state) => state.events);
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [searchParams] = useSearchParams();
    const eventData = searchParams.get("isEvent");
    const dispatch = useDispatch();

    useEffect(() => {
        if (!allProducts || allProducts.length === 0) {
            dispatch(getAllProducts());
        }
        if (!allEvents || allEvents.length === 0) {
            dispatch(getAllEvents());
        }
    }, [dispatch, allProducts, allEvents]);

    useEffect(() => {
        let found = null;
        if (eventData !== null) {
            found = allEvents && allEvents.find((i) => i._id === id);
        } else {
            found = allProducts && allProducts.find((i) => i._id === id);
        }

        if (!found) {
            found =
                (allProducts && allProducts.find((i) => i._id === id)) ||
                (allEvents && allEvents.find((i) => i._id === id));
        }

        setData(found || null);
    }, [allProducts, allEvents, id, eventData]);

    return (
        <div>
            <Header />
            <ProductDetails data={data} />
            {
                !eventData && (
                    <>
                        {data && <SuggestedProduct data={data} />}
                    </>
                )
            }
            <Footer />
        </div>
    )
}

export default ProductDetailsPage
