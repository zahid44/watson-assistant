/*I ask node.js to get the axios*/
const axios = require('axios');
/*Set the api key*/
const apiKey = "719387f99fmshae81eb72acee8b2p1281f2jsn03284f71a05a";

/*Global variables*/


/*This function get the airport code*/
function GetAirportCode(city) {
    /*I prepare the option*/
    var options = {

        url: "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/autosuggest/v1.0/UK/GBP/en-GB/?query="+city,

        headers: {
            "X-RapidAPI-Key": apiKey,
            "Content-Type": "application/json"
        },

    };
    /*I send the request*/
    return axios(options)
        .then((response)=> {
            return response.data.Places[0].PlaceId;
        })
        .catch(error => {
            console.log(error);
        });
}
/*Function that get the session url*/
function GetUrlSession(partenza, arrivo, dp, da, classe, adulti, bambini) {
    /*Here I prepare the data*/
    var qs = require('qs');
    data = qs.stringify({
        inboundDate:da,
        cabinClass: classe,
        children: bambini,
        infants:"0",
        groupPricing:"false",
        country:"US",
        currency:"EUR",
        locale:"en-US",
        originPlace: partenza,
        destinationPlace: arrivo,
        outboundDate: dp,
        adults: adulti
    });
    /*I set the option*/
    var options = {
        method: 'POST',
        url: "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/pricing/v1.0",

        headers: {
            "X-RapidAPI-Key": apiKey,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data
    };
    /*I send the request*/
    return axios(options)
        .then(response => {
            return response.headers.location
        })
        .catch(error => {
            console.log(error);
        });
}
/*function ticket it take the url session and get the price*/
function GetTheTicket(urlSession) {
    /*I prepare the option*/
    var options = {
        url: urlSession,

        headers: {
            "X-RapidAPI-Key": apiKey,
            "Content-Type": "application/json"
        },
    };
/*I send the request*/
    return axios(options)
        .then(response => {
            return response.data.Itineraries[0].PricingOptions[0].Price;
        })
        .catch(error => {
            console.log(error);
        });
}

/*Main*/
async function ResolvePromise(cityD, cityA, dd, ad, c ,p) {
    try {
        /*I resolve the Promise for Partenza*/
        const PromiseForPartenza = GetAirportCode(cityD);
        const partenza = await Promise.resolve(PromiseForPartenza);
        console.log("Dopo await partenza ", partenza);

        /*I resolve the Promise for Arrivo*/
        const PromiseForArrivo = GetAirportCode(cityA);
        const arrivo = await Promise.resolve(PromiseForArrivo);
        console.log("Dopo await arrivo ", arrivo);

        /*I resolve the url*/
        const PromiseForUrl = await GetUrlSession(partenza, arrivo, dd, ad, c, p, "0");
        const url = await Promise.resolve(PromiseForUrl);
        var code = url.slice(64); /*NB I need only the code url is wrong*/
        var address = "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/pricing/uk2/v1.0/" + code + "?pageIndex=0&pageSize=10";
        console.log("Dopo await url ", code);

        /*I resolve the price ticket*/
        const PromiseForTicket = GetTheTicket(address);
        const price = await Promise.resolve(PromiseForTicket);
        console.log("Dopo await price ", price);
        /*return json ok*/
        return {
            'from'    : partenza,
            'to'      : arrivo,
            'session' : code,
            'price'   : price
        };
    }
    catch (e) {
        console.error(e);
        /*return json error*/
        return {
           'error' : 'Something goes wrong'
        };
    }

}

function main(cityD, cityA, dd, ad, c, p) {


    return ResolvePromise(cityD, cityA, dd, ad, c, p);
}

main("Mil", "Sto", "2019-03-03", "2019-03-10", "business", "1");