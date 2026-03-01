import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Heart,
  Clock,
  Users,
  Star,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
};

const fakeServices = [
  {
    _id: "1",
    name: "Elderly Home Care",
    slug: "elderly-home-care",
    categoryName: "Senior Care",
    basePrice: 1200,
    picUrl:
      "https://plus.unsplash.com/premium_photo-1673953509975-576678fa6710?q=80&w=1170&auto=format&fit=crop",
  },
  {
    _id: "2",
    name: "Home Nursing",
    slug: "home-nursing",
    categoryName: "Medical Care",
    basePrice: 1800,
    picUrl:
      "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&auto=format&fit=crop&q=60",
  },
  {
    _id: "3",
    name: "Physiotherapy at Home",
    slug: "physiotherapy-at-home",
    categoryName: "Rehabilitation",
    basePrice: 1500,
    picUrl:
      "https://plus.unsplash.com/premium_photo-1672760403439-bf51a26c1ae6?w=800&auto=format&fit=crop&q=60",
  },
];

const Home = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    setServices(fakeServices);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* ================= NAVBAR ================= */}
      <nav className="w-full bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600 cursor-not-allowed">
            Carely
          </h1>

          <div className="hidden md:flex gap-8 text-gray-600 font-medium">
            <a href="#services" className="hover:text-blue-600 ">
              Services
            </a>
            <a href="#how" className="hover:text-blue-600">
              How It Works
            </a>
            <Link to="/login" className="hover:text-blue-600">
              Login
            </Link>
          </div>

          <Link
            to="/register"
            className="bg-black text-white px-5 py-2 rounded-full text-sm"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section className="py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.15 }}
            className="space-y-6"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-1.5 rounded-full text-sm font-medium"
            >
              <ShieldCheck size={16} /> Trusted Care Platform
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl font-bold leading-tight"
            >
              Compassionate Care for Your Loved Ones
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg text-gray-600">
              Book verified caregivers for elderly support, nursing,
              physiotherapy and more.
            </motion.p>

            <motion.div variants={fadeUp} className="flex gap-4 pt-4">
              <Link
                to="/login"
                className="bg-black text-white px-8 py-3 rounded-full"
              >
                Find Care Now
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <img
              src="https://plus.unsplash.com/premium_photo-1681843126728-04eab730febe?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Z3JvdXAlMjBvZiUyMGRvY3RvcnN8ZW58MHx8MHx8fDA%3D"
              alt="Caregiver"
              loading="lazy"
              className="rounded-3xl shadow-xl"
            />
          </motion.div>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Core Services</h2>
            <p className="text-gray-600">
              Professional care tailored to individual needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all border overflow-hidden"
              >
                <img
                  src={service.picUrl}
                  alt={service.name}
                  className="h-48 w-full object-cover"
                />

                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{service.name}</h3>

                  <p className="text-gray-500 text-sm mb-4">
                    {service.categoryName}
                  </p>

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-600">
                      ₹{service.basePrice}
                    </span>

                    <Link
                      to={`/services/${service.slug}`}
                      className="text-blue-600 font-medium flex items-center"
                    >
                      View <ArrowRight size={14} className="ml-1" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW CARELY WORKS ================= */}
      <section id="how" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-16">How Carely Works</h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              "Create User Profile",
              "Create Patient Profile & Link",
              "Select Service",
              "Book & Relax",
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-md"
              >
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-xl">
                  {i + 1}
                </div>

                <h3 className="font-semibold text-lg mb-3">{step}</h3>

                <p className="text-gray-600 text-sm">
                  Simple, secure and guided process for seamless care booking.
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-black text-white py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-3">Carely</h3>
            <p className="text-gray-400 text-sm">
              Trusted home healthcare services platform connecting families with
              verified caregivers.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2 text-gray-400 text-sm">
              <a href="#services">Services</a>
              <a href="#how">How It Works</a>
              <Link to="/login">Login</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <p className="text-gray-400 text-sm">
              support@carely.com <br />
              +91 12345 78965
            </p>
          </div>
        </div>

        <div className="text-center text-gray-500 text-xs mt-10">
          © {new Date().getFullYear()} Carely. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
