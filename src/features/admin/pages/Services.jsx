import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { commonAPI } from "../../common/commonAPI";
import { adminAPI } from "../adminAPI";
import { useToast } from "../../../components/ui/ToastProvider";

function Services() {
  const { showToast } = useToast();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedService, setSelectedService] = useState(null);
  const [formMode, setFormMode] = useState(""); // add | edit

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const servicesPerPage = 6;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: "",
    categoryName: "",
    requiredQualification: "",
  });

  const [backendCategoryList, setBackendCategoryList] = useState(null);

  //   ================= GET CATEGORY =================
  const getCategories = async () => {
    try {
      const res = await commonAPI.getCategories();
      setBackendCategoryList(res.data.data);
    } catch (error) {
      showToast("Unable to load categories");
    }
  };

  // ================= FETCH SERVICES =================
  const fetchServices = async () => {
    try {
      setLoading(true);

      const res = await commonAPI.getServices({
        page: currentPage,
        limit: servicesPerPage,
      });

      if (res?.data?.success) {
        setServices(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (error) {
      showToast("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    getCategories();
  }, [currentPage]);

  // ================= HANDLE ADD / UPDATE =================
  const handleSubmit = async () => {
    try {
      if (
        !formData.name ||
        !formData.description ||
        !formData.basePrice ||
        !formData.categoryName
      ) {
        return showToast("Please fill all required fields");
      }

      const payload = {
        ...formData,
        basePrice: Number(formData.basePrice),
        requiredQualification: formData.requiredQualification
          ? formData.requiredQualification.split(",")
          : [],
      };

      if (formMode === "add") {
        await adminAPI.createService(payload);
        showToast("Service added successfully");
      } else {
        await adminAPI.updateService(selectedService._id, payload);
        showToast("Service updated successfully");
      }

      resetForm();
      fetchServices();
    } catch (error) {
      showToast("Operation failed");
    }
  };

  const resetForm = () => {
    setSelectedService(null);
    setFormMode("add");
    setFormData({
      name: "",
      description: "",
      basePrice: "",
      categoryName: "",
      requiredQualification: "",
    });
  };

  // ================= DELETE SERVICE =================
  const handleDelete = async (id) => {
    if (!id) {
      return showToast("Invalid ID");
    }
    const confirmDelete = window.confirm("YOU WANT TO DELETE?");

    if (!confirmDelete) return; // if user clicks "No", exit
    try {
      // alert("YOU WANT TO DELETE")
      setLoading(true);
      await adminAPI.deleteService(id);
      showToast("Service deleted");
      fetchServices();
    } catch {
      showToast("Failed to delete service");
    } finally {
      setLoading(false);
    }
  };

  // ================= GET ONE SERVICE =================
  const handleEdit = async (id) => {
    try {
      const res = await commonAPI.getServiceInfo(id);
      if (res.data.success) {
        const service = res.data.data;

        setSelectedService(service);
        setFormMode("edit");

        setFormData({
          name: service.name,
          description: service.description,
          basePrice: service.basePrice,
          categoryName: service.categoryName,
          requiredQualification: service.requiredQualification?.join(","),
        });
      }
    } catch {
      showToast("Failed to load service");
    }
  };

  // ================= REMOVE QUALIFICATION =================
  const removeQualification = async (serviceId, qualification) => {
    try {
      await adminAPI.removeQualification(serviceId, { qualification });
      showToast("Qualification removed");
      fetchServices();
    } catch {
      showToast("Failed to remove qualification");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Service Management</h1>

        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => {
            if (formMode === "") {
              setFormMode("add");
            }
            if (formMode === "add" || formMode === "edit") {
              setFormMode("");
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          + Add Service
        </motion.button>
      </div>

      {/* FORM MODAL */}
      <AnimatePresence>
        {(formMode === "add" || selectedService) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white p-6 rounded-xl shadow-lg mb-6"
          >
            <h2 className="text-lg font-semibold mb-4">
              {formMode === "add" ? "Add Service" : "Edit Service"}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="Service Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="border p-2 rounded"
              />
              <input
                placeholder="Base Price"
                value={formData.basePrice}
                onChange={(e) =>
                  setFormData({ ...formData, basePrice: e.target.value })
                }
                className="border p-2 rounded"
              />

              <select
                value={formData.categoryName}
                placeholder="Category Name"
                onChange={(e) =>
                  setFormData({ ...formData, categoryName: e.target.value })
                }
                className="p-2 border rounded"
              >
                <option value="">All Categories</option>
                {backendCategoryList?.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <input
                placeholder="Qualifications (comma separated)"
                value={formData.requiredQualification}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requiredQualification: e.target.value,
                  })
                }
                className="border p-2 rounded"
              />
            </div>

            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="border p-2 rounded mt-4 w-full"
            />

            <div className="flex gap-4 mt-4">
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                {formMode === "add" ? "Create" : "Update"}
              </button>

              <button
                onClick={resetForm}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SERVICES LIST */}
      <div className="grid md:grid-cols-3 gap-6">
        {services.map((service) => (
          <motion.div
            key={service._id}
            whileHover={{ y: -5 }}
            className="bg-white p-4 rounded-xl shadow"
          >
            <h3 className="font-semibold">{service.name}</h3>
            <p className="text-sm text-gray-500">{service.categoryName}</p>
            <p className="text-blue-600 font-medium">₹{service.basePrice}</p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleEdit(service._id)}
                className="text-sm bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(service._id)}
                className="text-sm bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10 gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded border ${
                currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-white"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Services;
