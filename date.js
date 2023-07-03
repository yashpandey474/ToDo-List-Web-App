//MODULE FOR GETTING FORMATTED DATE

exports.getDate = function (){
    //WEEKEND OR NOT
    const today = new Date();

    //OPTIONS FOR THE METHOD
    const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
    };

    //CONVERT TO FORMATTED STRING
    return today.toLocaleDateString("en-US", options);
}

exports.getDay = function () {
    //WEEKEND OR NOT
    const today = new Date();

    //OPTIONS FOR THE METHOD
    const options = {
        weekday: "long"
    };

    //CONVERT TO FORMATTED STRING
    let day = today.toLocaleDateString("en-US", options);

    return day;
}