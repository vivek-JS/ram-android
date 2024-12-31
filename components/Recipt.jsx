import React from "react";
import { View, TouchableOpacity, Alert, Linking } from "react-native";
import moment from "moment";
import { Feather } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { getTotalPaidAmount } from "./PlaceListi";

const generatePDF = async (orderData) => {
  try {
    const {
      name,
      taluka,
      village,
      createdAt,
      plantType,
      plantSubtype,
      numberOfPlants,
      rate,
      payment,
      orderId,
    } = orderData;

    const totalAmount = rate * numberOfPlants;
    const totalPaid = getTotalPaidAmount(payment);
    const remainingAmount = totalAmount - totalPaid;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            }
            
            body {
              padding: 40px;
              color: #1F2937;
            }
            
            .container {
              max-width: 800px;
              margin: 0 auto;
            }
            
            .header {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 2px solid #E5E7EB;
            }
            
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #059669;
              margin-bottom: 8px;
            }
            
            .order-info {
              color: #6B7280;
              font-size: 14px;
            }
            
            .section {
              margin-bottom: 30px;
              border: 1px solid #E5E7EB;
              border-radius: 12px;
              overflow: hidden;
            }
            
            .section-title {
              font-size: 16px;
              font-weight: 600;
              color: white;
              padding: 12px 20px;
              background-color: #059669;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            
            .section-content {
              padding: 20px;
              background: white;
            }
            
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #E5E7EB;
            }
            
            .detail-row:last-child {
              border-bottom: none;
            }
            
            .label {
              color: #6B7280;
              font-size: 14px;
            }
            
            .value {
              font-weight: 600;
              color: #1F2937;
            }
            
            .total-section {
              margin-top: 30px;
              padding: 20px;
              background: #064E3B;
              color: white;
              border-radius: 12px;
            }
            
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              font-size: 16px;
            }
            
            .total-label {
              color: #A7F3D0;
            }
            
            .total-value {
              font-weight: bold;
            }
            
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #6B7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">ORDER RECEIPT</div>
              <div class="order-info">
                Order #${orderId} | ${moment(createdAt).format("DD MMM YYYY")}
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Customer Details</div>
              <div class="section-content">
                <div class="detail-row">
                  <span class="label">Name</span>
                  <span class="value">${name}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Location</span>
                  <span class="value">${village}, ${taluka}</span>
                </div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Order Details</div>
              <div class="section-content">
                <div class="detail-row">
                  <span class="label">Plant Type</span>
                  <span class="value">${plantType?.name}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Variety</span>
                  <span class="value">${plantSubtype?.name}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Quantity</span>
                  <span class="value">${numberOfPlants} plants</span>
                </div>
                <div class="detail-row">
                  <span class="label">Rate per Plant</span>
                  <span class="value">₹${rate}</span>
                </div>
              </div>
            </div>
            
            ${
              payment && Array.isArray(payment) && payment.length > 0
                ? `
            <div class="section">
              <div class="section-title">Payment History</div>
              <div class="section-content" style="padding: 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background-color: #F3F4F6; text-align: left;">
                      <th style="padding: 12px 16px; color: #374151; font-weight: 600; border-bottom: 1px solid #E5E7EB;">Sr.</th>
                      <th style="padding: 12px 16px; color: #374151; font-weight: 600; border-bottom: 1px solid #E5E7EB;">Date</th>
                      <th style="padding: 12px 16px; color: #374151; font-weight: 600; border-bottom: 1px solid #E5E7EB;">Amount</th>
                      <th style="padding: 12px 16px; color: #374151; font-weight: 600; border-bottom: 1px solid #E5E7EB;">Mode</th>
                      <th style="padding: 12px 16px; color: #374151; font-weight: 600; border-bottom: 1px solid #E5E7EB;">Status</th>
                      ${
                        payment.some((pay) => pay.bankName)
                          ? `
                      <th style="padding: 12px 16px; color: #374151; font-weight: 600; border-bottom: 1px solid #E5E7EB;">Bank</th>
                      `
                          : ""
                      }
                    </tr>
                  </thead>
                  <tbody>
                    ${payment
                      .map(
                        (pay, index) => `
                      <tr style="border-bottom: 1px solid #E5E7EB;">
                        <td style="padding: 12px 16px;">${index + 1}</td>
                        <td style="padding: 12px 16px;">${moment(
                          pay.paymentDate
                        ).format("DD MMM YYYY")}</td>
                        <td style="padding: 12px 16px; font-weight: 600;">₹${
                          pay.paidAmount || 0
                        }</td>
                        <td style="padding: 12px 16px;">${
                          pay.modeOfPayment || "N/A"
                        }</td>
                        <td style="padding: 12px 16px;">
                          <span style="
                            padding: 4px 8px;
                            border-radius: 4px;
                            font-size: 12px;
                            font-weight: 500;
                            ${
                              pay.paymentStatus === "COLLECTED"
                                ? "background-color: #DEF7EC; color: #03543F;"
                                : "background-color: #FEF3C7; color: #92400E;"
                            }
                          ">
                            ${pay.paymentStatus || "PENDING"}
                          </span>
                        </td>
                        ${
                          payment.some((pay) => pay.bankName)
                            ? `
                        <td style="padding: 12px 16px;">${
                          pay.bankName || "-"
                        }</td>
                        `
                            : ""
                        }
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
            </div>
            `
                : ""
            }
            
            <div class="total-section">
              <div class="total-row">
                <span class="total-label">Total Amount</span>
                <span class="total-value">₹${totalAmount}</span>
              </div>
              <div class="total-row">
                <span class="total-label">Paid Amount</span>
                <span class="total-value">₹${totalPaid}</span>
              </div>
              <div class="total-row">
                <span class="total-label">Remaining Amount</span>
                <span class="total-value">₹${remainingAmount}</span>
              </div>
            </div>
            
            <div class="footer">
              This is a computer generated receipt.
            </div>
          </div>
        </body>
      </html>
    `;

    // Generate the PDF file
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });

    const pdfFileName = `Order_${orderId}_${moment().format("DDMMYYYY")}.pdf`;
    const pdfDir = `${FileSystem.documentDirectory}pdfs/`;
    const pdfUri = `${pdfDir}${pdfFileName}`;

    await FileSystem.makeDirectoryAsync(pdfDir, { intermediates: true });
    await FileSystem.moveAsync({
      from: uri,
      to: pdfUri,
    });

    return pdfUri;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

const shareViaWhatsApp = async (pdfUri) => {
  try {
    const whatsappUrl = `whatsapp://send?text=Order Receipt`;
    const canOpen = await Linking.canOpenURL(whatsappUrl);

    if (canOpen) {
      await Sharing.shareAsync(pdfUri);
      await Linking.openURL(whatsappUrl);
    } else {
      Alert.alert("Error", "WhatsApp is not installed");
    }
  } catch (error) {
    console.error("WhatsApp sharing error:", error);
    Alert.alert("Error", "Failed to share. Please try again.");
  }
};

const downloadAndShare = async (orderData) => {
  try {
    const pdfUri = await generatePDF(orderData);
    await Sharing.shareAsync(pdfUri);
  } catch (error) {
    console.error("Sharing error:", error);
    Alert.alert("Error", "Failed to share. Please try again.");
  }
};

// Minimal icon buttons for sharing
const SharingButtons = ({ orderData }) => (
  <View
    style={{
      flexDirection: "row",
      //   position: "absolute",
      left: 12,
      // top: 12,
      gap: 8,
    }}
  >
    <TouchableOpacity
      style={{
        backgroundColor: "#25D366",
        padding: 6,
        borderRadius: 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
      }}
      onPress={async () => {
        try {
          const pdfUri = await generatePDF(orderData);
          await shareViaWhatsApp(pdfUri);
        } catch (error) {
          Alert.alert("Error", "Failed to share. Please try again.");
        }
      }}
    >
      <Feather name="share-2" size={16} color="#FFF" />
    </TouchableOpacity>

    {/* <TouchableOpacity
      style={{
        backgroundColor: "#3B82F6",
        padding: 8,
        borderRadius: 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
      }}
      onPress={() => downloadAndShare(orderData)}
    >
      <Feather name="download" size={16} color="#FFF" />
    </TouchableOpacity> */}
  </View>
);

export { SharingButtons, generatePDF, shareViaWhatsApp, downloadAndShare };
