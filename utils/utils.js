

exports.differenceDateTimeText = (start, end) => {
    var seconds = Math.floor((end - (start))/1000);
    var minutes = Math.floor(seconds/60);
    var hours = Math.floor(minutes/60);
    var days = Math.floor(hours/24);
    hours = hours-(days*24);
    minutes = minutes-(days*24*60)-(hours*60);
    seconds = seconds-(days*24*60*60)-(hours*60*60)-(minutes*60);
    return `${days} day(s), ${hours} hour(s), ${minutes} minute(s), ${seconds} second(s)`;
};
    

exports.differenceDateTimeNumerical = (start, end) => {
    var seconds = Math.floor((end - (start))/1000);
    return seconds;
};
    
exports.differenceDateTimeNumericalSecondsToText = (seconds) => {
    var minutes = Math.floor(seconds/60);
    var hours = Math.floor(minutes/60);
    var days = Math.floor(hours/24);
    hours = hours-(days*24);
    minutes = minutes-(days*24*60)-(hours*60);
    seconds = seconds-(days*24*60*60)-(hours*60*60)-(minutes*60);
    return `${days} day(s), ${hours} hour(s), ${minutes} minute(s), ${seconds} second(s)`;
};
    
exports.monthNames = (monthNumber) => {
    switch(monthNumber) {
        case 0:
            return 'Jan';
        case 1:
            return 'Feb';
        case 2:
            return 'Mar';
        case 3:
            return 'Apr';
        case 4:
            return 'May';
        case 5:
            return 'Jun';            
        case 6:
            return 'Jul';               
        case 7:
            return 'Aug';
        case 8:
            return 'Sep';
        case 9:
            return 'Oct';
        case 10:
            return 'Nov';
        case 11:
            return 'Dec';
        default:
            return 'Jan';
    }
};

exports.channelStatusTranslation = (status) => { 
    if(status === 0) {
        return 'Not Connected (might not exist).';
    } else if(status === 1) {
        return 'In service with product.';
    } else if(status === 2) {
        return 'In service but sold out.';
    } else if(status === 3) {
        return 'Channel faulty.';
    } else {
        return 'Not Connected (might not exist).';
    }
};