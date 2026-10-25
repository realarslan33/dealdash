import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import UserOrderDetails from "../components/UserOrderDetails";

const OrderDetailsPage = () => {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#f7f9fc]">
      <Header />
      <main className="flex-1 py-6 sm:py-10">
        <div className="mx-auto w-11/12 max-w-[1200px]">
          <UserOrderDetails />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderDetailsPage;
