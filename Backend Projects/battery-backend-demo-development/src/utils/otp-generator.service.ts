import { Injectable } from '@nestjs/common';
import axios from 'axios';
//import * as config from 'config';


//const encryptiontokenVerify = config.get('twoFactor');

@Injectable()
export class OtpGeneratorService {

    async  otpGen(payload:any) {
      
      console.log(payload);
      
      const response = await axios.post('https://testservices.exidecare.com/ISVCRegGeneric.svc/sendOtpForBatteryRegistrationByCustomer/', {
        LastName: payload.LastName,
        FirstName: payload.FirstName,
        encryptiontoken:payload.encryptiontoken,
        registrationFor:"H",
        batterySerialNumber:payload.batterySerialNumber,
        purchaseDate:payload.purchaseDate,
        mobileNumber:payload.mobileNumber,
        batteryType:"2",
        vehicleRegistrationNumber:"",
        Pincode:payload.Pincode

      })
      console.log("--"+JSON.stringify(response.data));
      return response.data
  }

  async  verOtp(sessionId: string, otp: string) {
    const response = await axios.post('https://testservices.exidecare.com/ISVCRegGeneric.svc/sendOtpForBatteryRegistrationByCustomer/', {
      encryptiontoken: "WHBdwSrYU-pVLhty-rETECop245gfs",
      sessionToken: sessionId,
      otp:otp

    })
    return response.data
}
}