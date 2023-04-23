function prettyPrintJson(jsonString: string): string {
    try {
      const jsonObject = JSON.parse(jsonString);
      const prettyJsonString = JSON.stringify(jsonObject, null, 2);
      return prettyJsonString;
    } catch (error) {
      console.error(error);
      return jsonString;
    }
}
  
export default prettyPrintJson;