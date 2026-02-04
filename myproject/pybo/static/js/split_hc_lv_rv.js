
window.onload = function () {
    // 좌우 분할
    window.splitInstance = Split(["#left-pane", "#right-pane"], {
        sizes: [50, 50], // 기본 비율을 50:50으로 설정
        minSize: 200,
        gutterSize: 8,
        cursor: "col-resize",
        gutter: function (index, direction) {
            const gutter = document.createElement("div");
            gutter.className = `gutter gutter-${direction}`;
            return gutter;
        },
        elementStyle: function (dimension, size, gutterSize) {
            return {
                "flex-basis": `calc(${size}% - ${gutterSize}px)`
            };
        },
        gutterStyle: function (dimension, gutterSize) {
            return {
                "flex-basis": `${gutterSize}px}`
            };
        }
    });

    // 왼쪽 상하 분할
    window.splitInstanceLeft = Split(["#left-top-pane", "#left-bottom-pane"], {
        direction: "vertical",
        sizes: [50, 50],
        minSize: 100,
        gutterSize: 8,
        cursor: "row-resize",
        gutter: function (index, direction) {
            const gutter = document.createElement("div");
            gutter.className = `gutter gutter-${direction}`;
            return gutter;
        },
        elementStyle: function (dimension, size, gutterSize) {
            return {
                "flex-basis": `calc(${size}% - ${gutterSize}px)`
            };
        },
        gutterStyle: function (dimension, gutterSize) {
            return {
                "flex-basis": `${gutterSize}px}`
            };
        }
    });

    // 오른쪽 상하 분할
    window.splitInstanceRight = Split(["#right-top-pane", "#right-bottom-pane"], {
        direction: "vertical",
        sizes: [50, 50],
        minSize: 100,
        gutterSize: 8,
        cursor: "row-resize",
        gutter: function (index, direction) {
            const gutter = document.createElement("div");
            gutter.className = `gutter gutter-${direction}`;
            return gutter;
        },
        elementStyle: function (dimension, size, gutterSize) {
            return {
                "flex-basis": `calc(${size}% - ${gutterSize}px)`
            };
        },
        gutterStyle: function (dimension, gutterSize) {
            return {
                "flex-basis": `${gutterSize}px}`
            };
        }
    });

    // 분할 영역과 비율을 변경하는 함수 정의
    window.changeSplitSizes = function (target, sizes) {
        switch (target) {
            case "horizontal":
                window.splitInstance.setSizes(sizes);
                break;
            case "leftVertical":
                window.splitInstanceLeft.setSizes(sizes);
                break;
            case "rightVertical":
                window.splitInstanceRight.setSizes(sizes);
                break;
        }
    };


    // 특정 스플릿바 비활성화 및 활성화 토글
    const toggleLeftVerticalGutterButton = document.getElementById("toggle-left-vertical-gutter");
    const toggleRightVerticalGutterButton = document.getElementById("toggle-right-vertical-gutter");
    const toggleHorizontalGutterButton = document.getElementById("toggle-horizontal-gutter");

    const leftVerticalGutter = document.querySelector(".gutter.gutter-vertical"); // 첫 번째로 나타나는 왼쪽 상하 스플릿바
    const rightVerticalGutter = document.querySelectorAll(".gutter.gutter-vertical")[1]; // 두 번째로 나타나는 오른쪽 상하 스플릿바
    const horizontalGutter = document.querySelector(".gutter.gutter-horizontal"); // 좌우 스플릿바

    toggleLeftVerticalGutterButton.addEventListener("click", () => {
        if (leftVerticalGutter.style.pointerEvents === "none") {
            leftVerticalGutter.style.pointerEvents = "auto"; // 활성화
        } else {
            leftVerticalGutter.style.pointerEvents = "none"; // 비활성화
        }
    });

    toggleRightVerticalGutterButton.addEventListener("click", () => {
        if (rightVerticalGutter.style.pointerEvents === "none") {
            rightVerticalGutter.style.pointerEvents = "auto"; // 활성화
        } else {
            rightVerticalGutter.style.pointerEvents = "none"; // 비활성화
        }
    });

    toggleHorizontalGutterButton.addEventListener("click", () => {
        if (horizontalGutter.style.pointerEvents === "none") {
            horizontalGutter.style.pointerEvents = "auto"; // 활성화
        } else {
            horizontalGutter.style.pointerEvents = "none"; // 비활성화
        }
    });
};

