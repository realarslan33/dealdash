import React from "react";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { BsStarHalf } from "react-icons/bs";


const Ratings = ({ rating, compact = false }) => {
    const stars = [];
    const starSize = compact ? 19 : 20;
    const starSpacing = compact ? "mr-0.5" : "mr-2";

    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars.push(
                <AiFillStar
                    key={i}
                    size={starSize}
                    color="#f6b100"
                    className={`${starSpacing} cursor-pointer`}
                />
            );
        } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
            stars.push(
                <BsStarHalf
                    key={i}
                    size={compact ? 19 : 17}
                    color="#f6ba00"
                    className={`${starSpacing} cursor-pointer`}
                />
            );
        } else {
            stars.push(
                <AiOutlineStar
                    key={i}
                    size={starSize}
                    color="#f6ba00"
                    className={`${starSpacing} cursor-pointer`}
                />
            );
        }
    }

    return <div className="flex"> {stars}</div>;

}

export default Ratings
