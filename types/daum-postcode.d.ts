export {};

declare global {
  type DaumPostcodeData = {
    zonecode?: string;
    address?: string;
    addressType?: "R" | "J";
    bname?: string;
    buildingName?: string;
    apartment?: "Y" | "N";
  };

  interface Window {
    daum?: {
      Postcode?: new (options: {
        oncomplete: (data: DaumPostcodeData) => void;
      }) => { open: () => void };
    };
  }
}
