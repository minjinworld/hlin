export {};

declare global {
  type DaumPostcodeData = {
    zonecode: string;
    address: string;
    roadAddress: string;
    jibunAddress: string;
    buildingName: string;
    apartment: "Y" | "N";
    addressType: "R" | "J";
    userSelectedType: "R" | "J";
    bname: string;
    sido: string;
    sigungu: string;
    sigunguCode: string;
  };

  type DaumPostcodeInstance = {
    open: () => void;
  };

  type DaumPostcodeConstructor = new (options: {
    oncomplete: (data: DaumPostcodeData) => void;
  }) => DaumPostcodeInstance;

  interface Window {
    daum?: {
      Postcode?: DaumPostcodeConstructor;
    };
  }
}
