let start_date, end_date;

document.addEventListener("DOMContentLoaded", function () {
    const deptFilterInput = document.getElementById("deptFilter");
    const empNameFilterInput = document.getElementById("empNameFilter");
    const table = document.getElementById("events-table").getElementsByTagName("tbody")[0];
    const cancelViewEventButton = document.getElementById("cancelViewEvent");
    const calendarEl = document.getElementById("calendar");
    const calendar = $("#calendar").fullCalendar({
        locale: "ko",
        firstDay: 1,
        height: 600, // 캘린더 높이 설정 (필요에 따라 조정)
        displayEventTime: false, // 시간 표시 제거
        fixedWeekCount: false,


        viewRender: function (view, element) {
        // 헤더의 요일 컬러 변경
            $(".fc-day-header").each(function () {
                const headerText = $(this).text();
                if (headerText === "토") {
                    $(this).addClass("fc-sat");
                } else if (headerText === "일") {
                    $(this).addClass("fc-sun");
                }
            });

            // 현재 년월을 가져와서 fetch 요청
            const currentYear = view.intervalStart.year();
            const currentMonth = view.intervalStart.month() + 1; // month() is 0-indexed
            const serviceKey = "b73e0ceb74a83aca9429452b212948501f85995d66bb2a66a5f35eb01b71f4a1";
            const url = `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo?serviceKey=${serviceKey}&solYear=${currentYear}&solMonth=${("0" + currentMonth).slice(-2)}&_type=json`;

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    // locdate 값만 배열로 추출
                    const locdates = [];
                    if (data.response.body.items) {
                        let items = data.response.body.items.item;
                        if (!Array.isArray(items)) {
                            items = [items]; // 단일 객체를 배열로 변환
                        }
                        items.forEach(holiday => {
                            locdates.push(holiday.locdate);
                        });
                    }

                    // 공휴일 날짜 텍스트 빨간색으로 표시
                    locdates.forEach(date => {
                        const formattedDate = moment(date.toString(), "YYYYMMDD").format("YYYY-MM-DD");
                        const cell = $(`td[data-date="${formattedDate}"]`);
                        cell.find(".fc-day-number").css("color", "red");
                    });
                })
                .catch(error => {
                    alert("에러 발생: " + error);
                    console.error("Fetch 에러: ", error);
                });

            // 현재 날짜로 이벤트 테이블 업데이트
            const today = moment();

            // 현재 뷰의 첫 번째 일자를 가져옴
            const firstCellDate = moment(view.intervalStart).startOf("week");

            // 시작 날짜와 종료 날짜 설정
            let start_date, end_date;

            if (firstCellDate.isSame(today, "month") && firstCellDate.isSame(today, "year")) {
                start_date = today;
                end_date = today;
            } else {
                start_date = firstCellDate.startOf("month");
                end_date = firstCellDate.clone().endOf("month");
            }
        },

        dayRender: function (date, cell) {
            const day = date.day();
            if (day === 6) {

                cell.addClass("fc-sat");
            } else if (day === 0) {
                cell.addClass("fc-sun");
            }
        },

        events: function (start, end, timezone, callback) {
            const start_date_to_use = start_date ? start_date.format() : start.format();
            const end_date_to_use = end_date ? end_date.format() : end.format();
            $.ajax({
                url: "/get_events",
                method: "GET",
                data: {
                    start: start_date_to_use,
                    end: end_date_to_use
                },
                success: function (data) {
                    // 이벤트를 시작 시간 기준으로 정렬
                    data.sort((a, b) => new Date(a.WkBegDateTime) - new Date(b.WkBegDateTime));

                    const events = data.map(event => {
                        return {
                            dept: event.DeptName, // 부서 추가
                            title: event.VacReason,
                            start: event.WkBegDateTime,
                            end: event.WkEndDateTime,
                            color: event.out_color,
                            user: event.EmpName,
                            description: event.VacReason,
                            etc: event.id,
                            empSeq: event.EmpSeq // 사원번호 추가
                        };
                    });
                    callback(events);
                    // 페이지 로드 시 현재 일자(오늘)로 스크롤
                    //scrollToCurrentDate();
                },
                error: function (xhr, status, error) {
                    alert("Ajax error: " + error);
                }
            });
        },

        /*
        dayClick: function(date, jsEvent, view) {
        const lastClickTime = $(this).data('lastClickTime') || 0;
        const now = new Date().getTime();

        if (now - lastClickTime < 500) {
          openEventModal(date); // 날짜를 Date 객체로 전달하여 팝업 열기
        }
        // 선택한 날짜의 배경색을 하늘색으로 변경
        $('td').css('background-color', ''); // 이전 선택 초기화
        $(`td[data-date="${date.format('YYYY-MM-DD')}"]`).css('background-color', 'skyblue');
        $(this).data('lastClickTime', now);
      },
      */
        eventRender: function (event, element) {
        // Only show 사원명 and 사유
            const title = `${event.dept}: ${event.user}`;
            element.find(".fc-title").text(title);
            element.find(".fc-title").html(title + "<br/>" + event.description);

            element.dblclick(function () {
                openViewEventModal(event); // 이벤트 데이터 전달
            });
        }
    });


    $("#cancelViewEvent").on("click", function () {
        const out_start = $("#view-modal-startdatetime").text();
        const out_end = $("#view-modal-enddatetime").text();
        let out_user = $("#view-modal-user").text();
        let out_desc = $("#view-modal-description").text();

        // out_start와 out_end를 MSSQL datetime 형식으로 변환
        const out_start_datetime = moment(out_start, "YYYY-MM-DD HH:mm").format("YYYY-MM-DDTHH:mm:ss");
        const out_end_datetime = moment(out_end, "YYYY-MM-DD HH:mm").format("YYYY-MM-DDTHH:mm:ss");

        // "성명:", "사유:" 라벨을 제거
        out_user = out_user.replace(/^성명:\s*/, "");
        out_desc = out_desc.replace(/^사유:\s*/, "");

        if (out_start_datetime || out_end_datetime) {
            if (confirm("정말 삭제하시겠습니까?")) {
                $.ajax({
                    url: "/delete_event",
                    method: "POST",
                    data: { start: WkBegDateTime,
                        end: WkEndDateTime,
                        user: EmpName,
                        description: VacReason
                    },
                    success: function (response) {
                        if (response.success) {
                            alert("외근 등록 내역이 삭제되었습니다.");
                            // 캘린더를 다시 렌더링하여 이벤트를 업데이트
                            calendar.fullCalendar("refetchEvents");

                            //오늘의 외근 현항 조회
                            updateEventsTable(moment());
                        } else {
                            alert("외근 등록 내역 삭제 중 오류가 발생했습니다.");
                        }
                    },
                    error: function () {
                        alert("서버와의 통신 중 오류가 발생했습니다.");
                    }
                });
            }
        } else {
            alert("삭제할 데이터를 찾을 수 없습니다.");
        }
    });


    // 모달 창 닫기 버튼
    $("#closeEventModal").click(function () {
        $("#eventModal").hide();
    });

    // 모달 저장 버튼
    $("#saveEvent").click(function () {
        const user = $("#user").val();
        const description = $("#description").val();
        const starttime = $("#starttime").val();
        const endtime = $("#endtime").val();
        const color = $("#color").val();

        if (user && description && starttime && endtime) {
            const eventData = {
            //user: user, // 사용자 데이터 저장
            //title: description,
            //start: starttime,
            //end: endtime,
            //color: color // 색상 데이터 저장
            };


            $("#calendar").fullCalendar("renderEvent", eventData, true);

            $.ajax({
                url: "/add_event",
                data: {
                    user: EmpName,
                    description: description,
                    starttime: WkBegDateTime,
                    endtime: WkEndDateTime,
                    color: color
                },
                type: "POST",
                success: function (response) {
                    if (response.success) {
                        alert("외근 등록이 완료되었습니다.");
                        // 캘린더를 다시 렌더링하여 이벤트를 업데이트
                        $("#calendar").fullCalendar("refetchEvents");

                        //오늘의 외근 현항 조회
                        updateEventsTable(moment());

                        $("#eventModal").hide();
                    } else {
                        alert("외근 등록 중 오류가 발생했습니다.");
                    }
                },
                error: function (xhr, status, error) {
                    console.error("AJAX Error:", status, error);
                    alert("서버와의 통신 중 오류가 발생했습니다.");
                }
            });
        }
    });

    // 조회 버튼 클릭 이벤트 리스너 추가 (사용안함)
    document.getElementById("SearchEventModal").addEventListener("click", function () {
        const dept = $("#deptFilter").val();
        const name = $("#nameFilter").val();
        updateEventsTable(dept, name); // 필터 조건으로 조회
    });


    // 뷰 모달 창 닫기 버튼 (조회용)
    $("#closeViewEventModal").click(function () {
        $("#viewEventModal").hide();
    });

    // 뷰 모달 삭제 버튼 (조회용)
    $("#cancelViewEvent").click(function () {
        $("#viewEventModal").hide();
    });

    const deptFilter = document.getElementById("deptFilter").value;
    const empNameFilter = document.getElementById("empNameFilter").value;

    // 필터 값을 이용하여 데이터 조회를 수행하는 함수 호출
    updateEventsTable(deptFilter, empNameFilter);

    $(document).ready(function () {
        window.eventsTable = $("#events-table").DataTable({
            "language": {
                "lengthMenu": "",
                "zeroRecords": "검색 결과가 없습니다.",
                "info": "총 _TOTAL_ 개 항목 중 _START_ 에서 _END_ 까지 표시",
                "infoEmpty": "항목이 없습니다.",
                "infoFiltered": "(전체 _MAX_ 항목 중 검색됨)",
                "paginate": {
                    "first": "처음",
                    "last": "마지막",
                    "next": "다음",
                    "previous": "이전"
                }
            },
            "paging": true,
            "pageLength": 10,
            "dom": '<"top"ip>rt<"bottom"><"clear">'
        });
    });

    // 받은 날짜값을 date 형태로 형변환 해주어야 한다.
    function convertDate(date) {
        var date = new Date(date);
        alert(date.yyyymmdd());
    }
    // 팝업 창 열 때 필드 초기화 (신규)
    function openEventModal(date) {
        const currentDateTime = moment().tz("Asia/Seoul"); // 한국 시간으로 현재 시간 설정
        const startOfDay = moment(date).tz("Asia/Seoul").startOf("day"); // 선택한 일자의 시작 시간 (한국 시간)
        const endOfDay = moment(date).tz("Asia/Seoul").endOf("day"); // 선택한 일자의 종료 시간 (한국 시간)

        const hours = ("0" + currentDateTime.hours()).slice(-2);
        const minutes = ("0" + currentDateTime.minutes()).slice(-2);

        // 현재 시간을 10분 단위로 반올림
        const roundedCurrentTime = moment(Math.ceil(currentDateTime.valueOf() / (10 * 60 * 1000)) * (10 * 60 * 1000)).tz("Asia/Seoul");
        const roundedCurrentTime2 = moment(Math.ceil(currentDateTime.valueOf() / (10 * 60 * 1000)) * (10 * 60 * 1000)).tz("Asia/Seoul").add(1, "hours");
        const formattedTime = roundedCurrentTime.format("HH:mm");
        const formattedTime2 = roundedCurrentTime2.format("HH:mm");

        const startDate = startOfDay.format("YYYY-MM-DD");
        const endDate = endOfDay.format("YYYY-MM-DD");

        $("#user").val("");
        $("#description").val("");

        if (currentDateTime.isSame(date, "day")) {
        // 선택한 날짜가 오늘인 경우
            $("#starttime").val(`${startDate}T${formattedTime}`);
            $("#endtime").val(`${startDate}T${formattedTime2}`);
        } else {
        // 선택한 날짜가 오늘이 아닌 경우
            $("#starttime").val(`${startDate}T${formattedTime}`);
            $("#endtime").val(`${endDate}T${formattedTime2}`);
        }

        $("#color").val("#3788d8"); // 기본 색상 설정
        $("#eventModal").show();
    }

    function scrollToCurrentDate() {
        const today = new Date();
        $("#calendar").fullCalendar("gotoDate", today);
    }

    // 조회용 팝업 창 열 때 데이터 채우기
    function openViewEventModal(event) {
        // Format the start and end datetimes
        const startDateTime = moment(event.start).format("YYYY-MM-DD HH:mm");
        const endDateTime = moment(event.end).format("YYYY-MM-DD HH:mm");

        // Populate the modal with event details
        $("#view-modal-startdatetime").text(`시작일시: ${startDateTime}`);
        $("#view-modal-enddatetime").text(`종료일시: ${endDateTime}`);
        $("#view-modal-user").text(`성명: ${event.user}`);
        $("#view-modal-description").text(`사유: ${event.title}`);
        $("#view-modal-color").text(`색상: ${event.color}`);

        // Show the modal
        $("#viewEventModal").show();
    }

    deptFilterInput.addEventListener("input", filterTable);
    empNameFilterInput.addEventListener("input", filterTable);

    function filterTable() {
        const deptFilterValue = deptFilterInput.value;
        const empNameFilterValue = empNameFilterInput.value;

        const table = window.eventsTable; // 이미 초기화된 DataTable 인스턴스

        // 부서명 필터 (0번 컬럼)
        table.column(0).search(deptFilterValue);

        // 사원명 필터 (1번 컬럼)
        table.column(1).search(empNameFilterValue);

        // 필터 적용 후 다시 그리기
        table.draw();
    }

    // 하단 그리드 조회 관련 함수
    function updateEventsTable(dept, name) {
        const formattedDate = moment().format("YYYY-MM-DD");

        $.ajax({
            url: "/get_events2",
            method: "GET",
            data: { start: formattedDate, end: formattedDate },
            success: function (data) {
                const table = window.eventsTable; // 이미 초기화된 인스턴스 사용

                // 기존 데이터 삭제 후 전체 데이터 추가
                table.clear();
                data.forEach(event => {
                    table.row.add([
                        event.DeptName,
                        event.EmpName,
                        event.WkItemName,
                        event.VacReason,
                        event.WkBegDateTime,
                        event.WkEndDateTime
                    ]);
                });
                table.draw();

                // 필터링 후 페이징 적용
                table.column(0).search(dept || ""); // DeptName 컬럼 필터
                table.column(1).search(name || ""); // EmpName 컬럼 필터
                table.draw(); // 필터링 후 페이징 다시 수행
            },
            error: function (xhr, status, error) {
                alert("Ajax error: " + error);
            }
        });
    }
});
