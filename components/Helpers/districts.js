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
    const params = { plantId };

    const response = await axiosInstance.get("/slots/subtyps", {
      params,
    });

    // Handle successful login
    if (response.data) {
      //    Alert.alert("Success", "Order added successfully");
      // router.back();
      seFunction(
        response?.data.map((district) => {
          return { label: district?.name, value: district?._id };
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
    const params = { plantId, subtypeId, year: 2024 };
    const response = await axiosInstance.get("/slots/getslots", {
      params,
    });

    // Handle successful login
    if (response.data) {
      //    Alert.alert("Success", "Order added successfully");
      // router.back();
      const data = response?.data[0]?.subtypeSlots[0]?.slots.filter(
        (slot) => slot?.status
      );
      seFunction(
        data.map((district) => {
          const {
            startDay,
            endDay,
            month,
            totalBookedPlants,
            totalPlants,
            status,
            _id,
          } = district || {};
          if (!status) {
            return;
          }
          return {
            label: `${startDay} - ${endDay} ${month} (${
              totalPlants - totalBookedPlants
            })`,
            value: _id,
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
