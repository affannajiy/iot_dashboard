async function getData() {
    const url = "http://localhost:3000/latestdata";
    try {
        const response = await fetch(url) //fetch the data from the url
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`)
        }
        const data_fetched = await response.json();
        console.log(JSON.stringify(data_fetched))
        return data_fetched.last_row
    } catch (err) {
        console.log(`Error occured: ${err}`)
        return null;
    }

}

export { getData };