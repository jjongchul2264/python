function openEventModal(date) {
    // Assuming you have a way to fetch the event data based on the date
    const eventData = getEventData(date); // You need to implement this function

    document.getElementById("modal-date").innerText = `날짜: ${eventData.date}`;
    document.getElementById("modal-time").innerText = `시간: ${eventData.time}`;
    document.getElementById("modal-content").innerText = `내용: ${eventData.content}`;

    document.getElementById("eventModal2").style.display = "block";
}

function closeEventModal() {
    document.getElementById("eventModal2").style.display = "none";
}

function getEventData(date) {
    // Dummy data for demonstration purposes
    return {
        date: date.format("YYYY-MM-DD"),
        time: "10:00", // Replace with actual time
        content: "회의" // Replace with actual content
    };
}

