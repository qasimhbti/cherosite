var replyForm = document.forms.namedItem("reply");
var replyButton = replyForm.querySelector("button");
replyButton.onclick = function() {
	// Set replyForm again.
	replyForm = document.forms.namedItem("reply");
	var replyLink = replyForm.dataset["action"];
	console.log(replyLink);
	var fData = new FormData(replyForm);
	var req = new XMLHttpRequest();
	req.open("POST", replyLink);
	req.onreadystatechange = function() {
		if (this.readyState == 4) {
			console.log(this.responseText);
		}
	};
	req.send(fData);
};

function setupReplyComs() {
	var replyComs = document.getElementsByClassName('replyCom');
	for (var i = replyComs.length - 1; i >= 0; i--) {
		replyForm = replyComs[i];
		replyButton = replyForm.querySelector("button");
		replyButton.onclick = function(i) {
			return function() {
				// Set replyform again.
				replyForm = replyComs[i];
				var replyLink = replyForm.dataset["action"];
				console.log(replyLink);
				var fData = new FormData(replyForm);
				var req = new XMLHttpRequest();
				req.open("POST", replyLink);
				req.onreadystatechange = function() {
					if (this.readyState == 4) {
						console.log(this.responseText);
					}
				};
				req.send(fData);
			};
		}(i);
	}
}

function setupViewSubcomments() {
	var comments = document.querySelectorAll(".thread-comments article");
	for (var i = comments.length - 1; i >= 0; i--) {
		let repliesBtn = comments[i].querySelector(".replies button");
		let subcommentsArea = comments[i].querySelector("div.subcomments");
		repliesBtn.onclick = function() {
			let link = repliesBtn.dataset["getSubcommentsLink"];
			let offset = repliesBtn.dataset["offset"];
			link = link + offset;

			let req = new XMLHttpRequest();
			req.open("GET", link, true);
			req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
			req.onreadystatechange = function() {
				if (this.readyState == 4) {
					if (this.status == 200) {
						// Check whether there were not subcomments.
						if (this.responseText == "OFFSET_OOR") {
							alert("There are no subcomments. Check back later");
							return;
						}
						// Append subcomments to the last subcomment.
						subcommentsArea.innerHTML += this.responseText;
						// Calculate total num of replies to update offset.
						offset = subcommentsArea.children.length;
						repliesBtn.dataset["offset"] = offset;
					} else {
						console.log(this.responseText);
					}
				}
			};
			req.send();
		};
	}
}

/*
// Script to delete comment.
var req = new XMLHttpRequest();
req.open("DELETE", "/mylife/example-post-16-2e1c906bc96c/comment/delete?c_id=5");
req.onreadystatechange = function() {
	if (this.readyState == 4) {
		console.log(this.responseText);
	}
};
req.send();

// Script to get 10 subcmments.
var req = new XMLHttpRequest();
req.open("GET", "/mylife/example-post-16-2e1c906bc96c/comment/?c_id=1&offset=0")
req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
var response
req.onreadystatechange = function() {
	if (this.readyState == 4) {
		response = this.responseText;
	}
};
req.send();
*/
