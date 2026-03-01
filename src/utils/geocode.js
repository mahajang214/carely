// src/utils/geocode.ts

export const getCoordinatesFromAddress = async (address) => {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(
            address
        )}`,
        {
            headers: {
                "Accept": "application/json",
            },
        }
    );

    const data = await response.json();

    if (!data.length) {
        throw new Error("Address not found");
    }

    const result = data[0];

    return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        fullAddress: result.display_name,
        city: result.address.city || result.address.town || "",
        state: result.address.state || "",
        pincode: result.address.postcode || "",
    };
};
