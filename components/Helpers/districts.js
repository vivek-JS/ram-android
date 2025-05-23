import moment from "moment";
import axiosInstance from "../api/api_instance";

export const getStates = async (seFunction) => {
  // Handle form submission
  try {
    // setSubmitting(true);

    const response = await axiosInstance.get("/location/states");

    // Handle successful login

    if (response.data) {
      //    Alert.alert("Success", "Order added successfully");
      // router.back();
      seFunction(
        response?.data.map((district) => {
          return { label: district?.stateName, value: district?._id };
        })
      );
    }
  } catch (error) {
    Alert.alert("Error", errorMessage);
  } finally {
    // setSubmitting(false);
  }
};
export const getDistrict = async (seFunction, stateId) => {
  // Handle form submission
  try {
    // setSubmitting(true);
    const params = { stateId };

    const response = await axiosInstance.get("/location/districts", {
      params,
    });

    // Handle successful login
    if (response.data) {
      //    Alert.alert("Success", "Order added successfully");
      // router.back();
      seFunction(
        response?.data.districts?.map((district) => {
          return { label: district?.name, value: district?._id };
        })
      );
    }
  } catch (error) {
    Alert.alert("Error", errorMessage);
  } finally {
    // setSubmitting(false);
  }
};
export const getPlants = async (seFunction) => {
  // Handle form submission
  try {
    // setSubmitting(true);

    const response = await axiosInstance.get("/slots/get-plants");
    // Handle successful login
    if (response.data) {
      //    Alert.alert("Success", "Order added successfully");
      // router.back();
      seFunction(
        response?.data.map((district) => {
          return { label: district?.name, value: district?.plantId };
        })
      );
    }
  } catch (error) {
    Alert.alert("Error", errorMessage);
  } finally {
    // setSubmitting(false);
  }
};

export const getTaluks = async (seFunction, stateId, districtId) => {
  // Handle form submission
  try {
    // setSubmitting(true);

    const params = { districtId, stateId };
    const response = await axiosInstance.get("/location/subdistricts", {
      params,
    });

    // Handle successful login

    if (response.data) {
      seFunction(
        response.data?.subDistricts.map((district) => {
          return { label: district?.name, value: district?._id };
        })
      );
    }
  } catch (error) {
    Alert.alert("Error", errorMessage);
  } finally {
    // setSubmitting(false);
  }
};

export const getVillages = async (
  seFunction,
  subDistrictId,
  districtId,
  stateId
) => {
  // Handle form submission
  try {
    // setSubmitting(true);
    const params = { subDistrictId, districtId, stateId };
    const response = await axiosInstance.get("/location/getVillages", {
      params,
    });

    //console.log(response.data.sub);

    // Handle successful login

    if (response.data?.villages) {
      //    Alert.alert("Success", "Order added successfully");
      // router.back();

      seFunction(
        response.data?.villages.map((district) => {
          return { label: district, value: district };
        })
      );
    }
  } catch (error) {
    Alert.alert("Error", errorMessage);
  } finally {
    // setSubmitting(false);
  }
};

export const getSubType = async (seFunction, plantId) => {
  // Handle form submission
  try {
    // setSubmitting(true);
    const params = { plantId, year: 2025 };

    const response = await axiosInstance.get("/slots/subtyps", {
      params,
    });

    // Handle successful login
    if (response.data) {
      //    Alert.alert("Success", "Order added successfully");
      // router.back();
      seFunction(
        response?.data?.subtypes.map((district) => {
          return {
            label: district?.subtypeName,
            value: district?.subtypeId,
            rate: district?.rate[0],
          };
        })
      );
    }
  } catch (error) {
    console.log(error);
    Alert.alert("Error", errorMessage);
  } finally {
    // setSubmitting(false);
  }
};

export const getSlots = async (seFunction, plantId, subtypeId) => {
  // Handle form submission
  try {
    // setSubmitting(true);
    const params = { plantId, subtypeId, year: 2025 };
    const response = await axiosInstance.get("/slots/getslots", {
      params,
    });

    // Handle successful login
    if (response) {
      //    Alert.alert("Success", "Order added successfully");
      // router.back();
      const data = response?.data?.slots[0]?.slots.filter(
        (slot) => slot?.status
      );
      seFunction(
        data
          .map((district) => {
            const {
              startDay,
              endDay,
              month,
              totalBookedPlants,
              totalPlants,
              status,
              _id,
            } = district || {};
            const start = moment(startDay, "DD-MM-YYYY").format("D");
            const end = moment(endDay, "DD-MM-YYYY").format("D");
            const monthYear = moment(startDay, "DD-MM-YYYY").format(
              "MMMM, YYYY"
            );
            if (!status) {
              return;
            }
            return {
              label: `${start} - ${end} ${monthYear}`,
              value: _id,
              available: totalPlants + totalBookedPlants - totalBookedPlants,
            };
          })
          .filter((data) => data?.available)
      );
    }
  } catch (error) {
    console.log(error);
    Alert.alert("Error", errorMessage);
  } finally {
    // setSubmitting(false);
  }
};

export const getFarmer = async (mobile, setDarmerData) => {
  // Handle form submission
  try {
    // setSubmitting(true);
    const response = await axiosInstance.get(`/farmer/getfarmer/${mobile}`);

    // Handle successful login
    if (response.data.data) {
      setDarmerData(response.data.data);
      //    Alert.alert("Success", "Order added successfully");
      // router.back();
    }
  } catch (error) {
    console.log(error);
    Alert.alert("Error", errorMessage);
  } finally {
    // setSubmitting(false);
  }
};
export const getBatches = async (setFunction) => {
  try {
    const response = await axiosInstance.get("/batch/all");

    if (response.data) {
      setFunction(
        response.data.data.data.map((batch) => {
          return { label: batch.batchNumber, value: batch._id };
        })
      );
    }
  } catch (error) {
    Alert.alert(
      "Error",
      error.response?.data?.message || "Failed to fetch batches"
    );
  }
};
export const gettray = async (setFunction) => {
  try {
    const response = await axiosInstance.get("/tray/all");

    if (response.data) {
      setFunction(
        response.data.data.data.map((batch) => {
          return { label: batch.cavity, value: batch._id };
        })
      );
    }
  } catch (error) {
    Alert.alert(
      "Error",
      error.response?.data?.message || "Failed to fetch batches"
    );
  }
};
export const getPolly = async (setFunction) => {
  try {
    const response = await axiosInstance.get("/pollyhouse/all");

    if (response.data) {
      setFunction(
        response.data.data.data.map((batch) => {
          return { label: batch.name, value: batch._id };
        })
      );
    }
  } catch (error) {
    Alert.alert(
      "Error",
      error.response?.data?.message || "Failed to fetch batches"
    );
  }
};
export const getSales = async (setFunction) => {
  try {
    const response = await axiosInstance.get("/employee/getEmployees", {
      params: {
        jobTitle: "SALES",
      },
    });
    if (response.data) {
      console.log(response.data);
      setFunction(
        response.data.data.map((batch) => {
          return { label: batch.name, value: batch._id };
        })
      );
    }
  } catch (error) {
    Alert.alert(
      "Error",
      error.response?.data?.message || "Failed to fetch batches"
    );
  }
};
export const getDealers = async (setFunction) => {
  try {
    const response = await axiosInstance.get("/employee/getEmployees", {
      params: {
        jobTitle: "DEALER",
      },
    });
    if (response.data) {
      console.log(response.data);
      setFunction(
        response.data.data.map((batch) => {
          return { label: batch.name, value: batch._id };
        })
      );
    }
  } catch (error) {
    Alert.alert(
      "Error",
      error.response?.data?.message || "Failed to fetch batches"
    );
  }
};
export const getCavities = async (setFunction) => {
  try {
    const response = await axiosInstance.get("/tray/all", {
      params: {
        jobTitle: "DEALER",
      },
    });
    if (response.data) {
      console.log("cavtitir", response.data);
      setFunction(
        response.data?.data?.data?.map((batch) => {
          return { label: batch.name, value: batch._id };
        })
      );
    }
  } catch (error) {
    Alert.alert(
      "Error",
      error.response?.data?.message || "Failed to fetch batches"
    );
  }
};
