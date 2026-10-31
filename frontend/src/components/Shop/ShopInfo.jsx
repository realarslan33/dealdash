import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAllProductsShop } from "../../redux/actions/product";
import { getImageUrl, server } from "../../server";
import Loader from "../Layout/Loader";



const ShopInfo = ({ isOwner }) => {
    const [data, setData] = useState({});
    const { products } = useSelector((state) => state.products);
    const [isLoading, setIsLoading] = useState(false);

    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();


    useEffect(() => {
        dispatch(getAllProductsShop(id));
        setIsLoading(true);
        axios.get(`${server}/shop/get-shop-info/${id}`).then((res) => {
            setData(res.data.shop);
            setIsLoading(false);
        }).catch((error) => {
            console.log(error);
            setIsLoading(false);
        })
    }, [])


    const logoutHandler = async () => {
        try {
            await axios.get(`${server}/shop/logout`, {
                withCredentials: true,
            });
        } catch (error) {
            console.error("Shop logout failed:", error);
        } finally {
            // Clear seller auth before leaving so cached seller data cannot
            // keep protected screens visible during navigation.
            dispatch({ type: "LogoutSeller" });
            // A full navigation discards the in-memory Redux store. Replace the
            // shop page in history so Back cannot reopen the logged-in dashboard.
            navigate("/shop-login", { replace: true });
        }
    };


    const totalReviewsLength =
        products &&
        products.reduce((acc, product) => acc + product.reviews.length, 0);

    const totalRatings = products && products.reduce((acc, product) => acc + product.reviews.reduce((sum, review) => sum + review.rating, 0), 0);

    const averageRating = totalRatings / totalReviewsLength || 0;



    return (
        <>
            {
                isLoading ? (
                    <Loader />
                ) : (
                    <div className="overflow-hidden rounded-xl border border-[#dce4f1] bg-white shadow-sm">
                        <div className="w-full px-5 py-6">
                            <div className="flex w-full items-center justify-center">
                                <img
                                    src={`${getImageUrl(data.avatar)}`}
                                    alt=""
                                    className="h-28 w-28 rounded-full border-4 border-[#eef2ff] object-cover shadow-sm sm:h-32 sm:w-32"
                                />
                            </div>
                            <h2 className="py-3 text-center text-xl font-semibold text-[#405d91]">{data.name}</h2>
                            <p className="whitespace-pre-line text-center text-sm leading-6 text-[#7183a3]">
                                {data.description}
                            </p>
                        </div>
                        <div className="border-t border-[#eef2ff] px-5 py-3">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8a9dc2]">Address</h3>
                            <p className="mt-1 text-sm text-[#405d91]">{data.address || "Not provided"}</p>
                        </div>
                        <div className="border-t border-[#eef2ff] px-5 py-3">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8a9dc2]">Phone Number</h3>
                            <p className="mt-1 text-sm text-[#405d91]">{data.phoneNumber || "Not provided"}</p>
                        </div>
                        <div className="border-t border-[#eef2ff] px-5 py-3">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8a9dc2]">Total Products</h3>
                            <p className="mt-1 text-sm font-medium text-[#405d91]">{products && products.length}</p>
                        </div>
                        <div className="border-t border-[#eef2ff] px-5 py-3">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8a9dc2]">Shop Ratings</h3>
                            <p className="mt-1 text-sm font-medium text-[#405d91]">{averageRating.toFixed(1)} / 5</p>
                        </div>
                        <div className="border-t border-[#eef2ff] px-5 py-3">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8a9dc2]">Joined On</h3>
                            <p className="mt-1 text-sm text-[#405d91]">{data?.createdAt?.slice(0, 10) || "Not listed"}</p>
                        </div>
                        {isOwner && (
                            <div className="border-t border-[#eef2ff] px-5 py-3">
                                <Link to={`/shop/preview/${id}`}>
                                    <div className="my-2 flex h-11 w-full items-center justify-center rounded-md border border-[#3957db] bg-white font-semibold text-[#3957db] transition-colors hover:bg-[#eef2ff]">
                                        <span>View Public Store</span>
                                    </div>
                                </Link>

                                <Link to="/settings">
                                    <div className="my-2 flex h-11 w-full items-center justify-center rounded-md bg-[#3957db] font-semibold text-white transition-colors hover:bg-[#2f49b7]">
                                        <span className="text-white">Edit Shop</span>
                                    </div>
                                </Link>

                                <div className="my-2 flex h-11 w-full cursor-pointer items-center justify-center rounded-md border border-[#dce4f1] bg-white font-semibold text-[#526b99] transition-colors hover:bg-[#f1f4f9]"
                                    onClick={logoutHandler}
                                >
                                    <span>Log Out</span>
                                </div>
                            </div>
                        )}
                    </div>
                )
            }
        </>
    );
};

export default ShopInfo;
