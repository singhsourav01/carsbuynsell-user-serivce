import axios from "axios";

const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || "https://admin.carsbuynsell.com/api/notification";

/**
 * Flow 1: Notify all users about a new listing
 */
export const notifyNewListing = async (
  listing_id: string,
  listing_title: string,
  listing_type: string
) => {
  try {
    await axios.post(`${NOTIFICATION_SERVICE_URL}/new-listing`, {
      listing_id,
      listing_title,
      listing_type,
    });
  } catch (err) {
    console.error("Failed to send new-listing notification:", err);
  }
};

/**
 * Flow 2: Notify user they were outbid
 */
export const notifyBidOutbid = async (
  listing_id: string,
  listing_title: string,
  outbid_user_id: string,
  new_bid_amount: number,
  new_bidder_name: string
) => {
  try {
    await axios.post(`${NOTIFICATION_SERVICE_URL}/bid-outbid`, {
      listing_id,
      listing_title,
      outbid_user_id,
      new_bid_amount,
      new_bidder_name,
    });
  } catch (err) {
    console.error("Failed to send outbid notification:", err);
  }
};

/**
 * Flow 3: Notify user about successful subscription
 */
export const notifySubscriptionSuccess = async (
  user_id: string,
  plan_name: string,
  expires_at: string
) => {
  try {
    await axios.post(`${NOTIFICATION_SERVICE_URL}/subscription-success`, {
      user_id,
      plan_name,
      expires_at,
    });
  } catch (err) {
    console.error("Failed to send subscription notification:", err);
  }
};

/**
 * Flow 4: Notify user about vehicle details submission
 */
export const notifyVehicleSubmitted = async (
  user_id: string,
  vehicle_title: string
) => {
  try {
    await axios.post(`${NOTIFICATION_SERVICE_URL}/vehicle-submitted`, {
      user_id,
      vehicle_title,
    });
  } catch (err) {
    console.error("Failed to send vehicle-submitted notification:", err);
  }
};
