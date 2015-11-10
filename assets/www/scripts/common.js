var scriptsXML = null;
var savedContacts = [];
var pictureSource;
var destinationType;
var db;

// BEGIN: Not needed in device - FOR WEB DEV ONLY. When releasing the app delete the below code or set isDev flag to false 
var isDev = false;

if(isDev)
{
	InitDB();
	
	var temp = '[{"uuid":"11","rawId":"11","displayName":"One","name":{"formatted":"One ","givenName":"One"},"nickname":null,"phoneNumbers":[{"type":"mobile","value":"(888) 555-7777","id":"33","pref":false}],"emails":null,"addresses":null,"ims":null,"organizations":null,"birthday":null,"note":null,"photos":null,"categories":null,"urls":null,"uuid":"f99d2170-b3ca-4850-a8a2-b63540fc05e2","rating":0},{"uuid":"15","rawId":"15","displayName":"User 13 - Cmp, Cmp Title, 2ph, 2em, 2ad, Notes, 1pic","name":{"middleName":"2em","familyName":"2ad","formatted":"User 13 - Cmp Cmp Title 2ph 2em 2ad Notes","givenName":"User 13 - Cmp Cmp Title 2ph","honorificSuffix":"Notes"},"nickname":null,"phoneNumbers":[{"type":"mobile","value":"11111111111111","id":"43","pref":false},{"type":"home","value":"(222) 222-2222","id":"44","pref":false}],"emails":[{"type":"home","value":"1111@asd.com","id":"47","pref":false},{"type":"work","value":"22222@sdf.com","id":"48","pref":false}],"addresses":[{"streetAddress":"Address 1111111","id":"45","formatted":"Address 1111111","type":"home","pref":false},{"streetAddress":"Addrtesssss 22222","id":"46","formatted":"Addrtesssss 22222","type":"work","pref":false}],"ims":null,"organizations":[{"id":"49","title":"Cmp Title","type":"custom","pref":false,"name":"Company Cmp"}],"birthday":null,"note":"Test niotes","photos":[{"value":"content://com.android.contacts/contacts/15/photo","type":"url","id":"51","pref":false}],"categories":null,"urls":null,"uuid":"9fcc562e-70dd-4270-8062-0f4d5b0ab4b8","rating":0},{"uuid":"2","rawId":"2","displayName":"User 2 - 2 Phone","name":{"middleName":"2","familyName":"Phone","formatted":"User 2 - 2 Phone","givenName":"User 2 -"},"nickname":null,"phoneNumbers":[{"type":"mobile","value":"222-2","id":"3","pref":false},{"type":"home","value":"444-44","id":"4","pref":false}],"emails":null,"addresses":null,"ims":null,"organizations":null,"birthday":null,"note":null,"photos":null,"categories":null,"urls":null,"uuid":"b1f6ef4d-485f-4157-8594-c3704a0706b3","rating":0}]';
	temp = JSON.parse(temp);
	for(var i=0; i<temp.length;i++)
	{
		InsertContactDB(temp[i]);
	}
	
	LoadSavedContactsObject();
}
//END: Not needed in device - FOR WEB DEV ONLY

var C = new Object();
C.NoItems = "No Items Found";
C.IndexID = "index";
C.ScriptsLevel1_2ID = "ScriptsLevel1_2";
C.ScriptsLevel1ID = "ScriptsLevel1";
C.ScriptsLevel2ID = "ScriptsLevel2";
C.ScriptsLevel3ID = "ScriptsLevel3";
C.ScriptsLevel1Value = "ScriptsLevel1Value";
C.ScriptsLevel2Value = "ScriptsLevel2Value";
C.RelationshipHomeID = "RelationshipHome";
C.ContactViewID = "ContactView";
C.ContactEditID = "ContactEdit";
C.NoContentHTML = "<h4>No content</h4>";
C.ContactIndex = "ContactIndex";
C.ContactSource = "ContactSource";
C.SelectedContact = "SelectedContact";
C.ContactMode = "ContactMode";
C.ContactNew = "ContactNew";
C.ContactPhonebook = "ContactPhonebook";
C.ContactEdit = "ContactEdit";
C.AddNew = "Add new";
C.EmergencyContactsID = "EmergencyContacts";
C.EmergencyGroupID = -1;
C.EmergencyGroupLabel = "Emergency";
C.ContactSearchString = "ContactSearchString";

C.NoLabel = "NO LABEL";
C.NoContactImagePath = "css/images/noimage.jpg";
C.ErrorOccurred = "An error occurred!";

document.addEventListener("deviceready", OnDeviceReady, false);

document.addEventListener("backbutton", function(e)
{
    if($.mobile.activePage.is('#index')){
    	ExitApp();
    }
    else {
    	NavigateBack();
    }
}, false);

function OnDeviceReady()
{
	InitDB();
	pictureSource = navigator.camera.PictureSourceType;
	destinationType = navigator.camera.DestinationType;
	LoadSavedContactsObject();
}

function InitDB()
{
	db = openDatabase('LifeAppDB', '1.0', 'Stores Life App data', 1 * 1024 * 1024);
	
	// check flag before creating tables and inserting default records
	// SetLocal("LastDBCreated", timestamp);
	
	db.transaction(function (tx) {
		tx.executeSql('CREATE TABLE IF NOT EXISTS groups (id INTEGER PRIMARY KEY AUTOINCREMENT, label, desc, color, sysKey, lastModified)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS subGroups (id INTEGER PRIMARY KEY AUTOINCREMENT, groupID, label, desc, color, sysKey, lastModified, FOREIGN KEY(groupID) REFERENCES groups(id))');
		tx.executeSql('CREATE TABLE IF NOT EXISTS contacts (id PRIMARY KEY, displayName, name, rating, phoneNumbers, emails, addresses, physicalDesc, metPerson, birthday, personalities, note, photo, groupID INTEGER, subGroupID INTEGER, lastModified, FOREIGN KEY(groupID) REFERENCES groups(id), FOREIGN KEY(subGroupID) REFERENCES subGroups(id))');
	});

	db.transaction(function (tx) {
		tx.executeSql(
			'INSERT INTO groups(label, desc, color, sysKey, lastModified) SELECT "Family", "Description of family", null, "family", ? WHERE NOT EXISTS(SELECT 1 FROM groups WHERE sysKey = "family")',
			[GetCurrentDateTime()],
			function (tx, result) {
		    },
		    function (tx, error) {
		    	OnError("C-101", true, error.message);
		    }
		);
		
		tx.executeSql(
			'INSERT INTO groups(label, desc, color, sysKey, lastModified) SELECT "Neighbors", "Description of neighbors", null, "neighbors", ? WHERE NOT EXISTS(SELECT 1 FROM groups WHERE sysKey = "neighbors")',
			[GetCurrentDateTime()],
			function (tx, result) {
		    },
		    function (tx, error) {
		    	OnError("C-102", true, error.message);
		    }
		);
		
		tx.executeSql(
			'INSERT INTO groups(label, desc, color, sysKey, lastModified) SELECT "' + C.EmergencyGroupLabel + '", "Description of emergency", "1", "emergency", ? WHERE NOT EXISTS(SELECT 1 FROM groups WHERE sysKey = "emergency")',
			[GetCurrentDateTime()],
			function (tx, result) {
		    },
		    function (tx, error) {
		    	OnError("C-103", true, error.message);
		    }
		);
		
		tx.executeSql(
			'INSERT INTO groups(label, desc, color, sysKey, lastModified) SELECT "Friends", "Description of friends", null, "friends", ? WHERE NOT EXISTS(SELECT 1 FROM groups WHERE sysKey = "friends")',
			[GetCurrentDateTime()],
			function (tx, result) {
		    },
		    function (tx, error) {
		    	OnError("C-104", true, error.message);
		    }
		);
		
		tx.executeSql(
			'INSERT INTO groups(label, desc, color, sysKey, lastModified) SELECT "School", "Description of school", null, "school", ? WHERE NOT EXISTS(SELECT 1 FROM groups WHERE sysKey = "school")',
			[GetCurrentDateTime()],
			function (tx, result) {
		    },
		    function (tx, error) {
		    	OnError("C-105", true, error.message);
		    }
		);
	
		var groupsID = new Object();
		
		tx.executeSql(
			'SELECT * FROM groups', 
			[],
			function (tx, results)
			{
				for (var index = 0; index < results.rows.length; index++)
				{
					var row = results.rows.item(index);
					
					groupsID[row.sysKey] = row.id;
				}
				
				InsertSubGroups(groupsID);
			},
			function (tx, error)
			{
				OnError("C-xxx", true, error.message);
			}
		);
	});
}

function InsertSubGroups(groupsID)
{
	C.EmergencyGroupID = groupsID.emergency;
	
	db.transaction(function (tx) {
		if(CheckObjectProperty(groupsID, "family", false))
		{
			tx.executeSql(
				'INSERT INTO subGroups(groupID, label, desc, color, sysKey, lastModified) SELECT ?, "Immediate Family", "Description of immediate family", null, "immediatefamily", ? WHERE NOT EXISTS(SELECT 1 FROM subGroups WHERE sysKey = "immediatefamily")',
				[groupsID.family, GetCurrentDateTime()],
				function (tx, result) {
			    },
			    function (tx, error) {
			    	OnError("C-xxx1", true, error.message);
			    }
			);
			
			tx.executeSql(
				'INSERT INTO subGroups(groupID, label, desc, color, sysKey, lastModified) SELECT ?, "Extended Family", "Description of extended family", null, "extendedfamily", ? WHERE NOT EXISTS(SELECT 1 FROM subGroups WHERE sysKey = "extendedfamily")',
				[groupsID.family, GetCurrentDateTime()],
				function (tx, result) {
			    },
			    function (tx, error) {
			    	OnError("C-xxx1", true, error.message);
			    }
			);
		}
		
		if(CheckObjectProperty(groupsID, "neighbor", false))
		{
		}
		
		if(CheckObjectProperty(groupsID, "emergency", false))
		{
			tx.executeSql(
				'INSERT INTO subGroups(groupID, label, desc, color, sysKey, lastModified) SELECT ?, "Doctor", "Description of doctor", null, "doctor", ? WHERE NOT EXISTS(SELECT 1 FROM subGroups WHERE sysKey = "doctor")',
				[groupsID.emergency, GetCurrentDateTime()],
				function (tx, result) {
			    },
			    function (tx, error) {
			    	OnError("C-xxx1", true, error.message);
			    }
			);
			
			tx.executeSql(
				'INSERT INTO subGroups(groupID, label, desc, color, sysKey, lastModified) SELECT ?, "Dentist", "Description of dentist", null, "dentist", ? WHERE NOT EXISTS(SELECT 1 FROM subGroups WHERE sysKey = "dentist")',
				[groupsID.emergency, GetCurrentDateTime()],
				function (tx, result) {
			    },
			    function (tx, error) {
			    	OnError("C-xxx1", true, error.message);
			    }
			);
			
			tx.executeSql(
					'INSERT INTO subGroups(groupID, label, desc, color, sysKey, lastModified) SELECT ?, "Counselor", "Description of counselor", null, "counselor", ? WHERE NOT EXISTS(SELECT 1 FROM subGroups WHERE sysKey = "counselor")',
					[groupsID.emergency, GetCurrentDateTime()],
					function (tx, result) {
				    },
				    function (tx, error) {
				    	OnError("C-xxx1", true, error.message);
				    }
				);
		}
		
		if(CheckObjectProperty(groupsID, "friends", false))
		{
		}
		
		
		if(CheckObjectProperty(groupsID, "school", false))
		{
			tx.executeSql(
				'INSERT INTO subGroups(groupID, label, desc, color, sysKey, lastModified) SELECT ?, "Math", "Description of math", null, "math", ? WHERE NOT EXISTS(SELECT 1 FROM subGroups WHERE sysKey = "math")',
				[groupsID.school, GetCurrentDateTime()],
				function (tx, result) {
			    },
			    function (tx, error) {
			    	OnError("C-xxx1", true, error.message);
			    }
			);
			
			tx.executeSql(
				'INSERT INTO subGroups(groupID, label, desc, color, sysKey, lastModified) SELECT ?, "Biology", "Description of biology", null, "biology", ? WHERE NOT EXISTS(SELECT 1 FROM subGroups WHERE sysKey = "biology")',
				[groupsID.school, GetCurrentDateTime()],
				function (tx, result) {
			    },
			    function (tx, error) {
			    	OnError("C-xxx1", true, error.message);
			    }
			);
		}
		
	});
}

$(document).on("pagecontainertransition", function(event, data)
{
	var currentPage = $.mobile.activePage.attr("id");
	
	switch(currentPage)
	{
		case C.RelationshipHomeID:
			RH.func.LoadSavedContacts();
			break;
			
		case C.ContactViewID:
			CV.func.LoadContact();
			break;
			
		case C.ContactEditID:
			CE.func.LoadContact();
			break;
			
		case C.EmergencyContactsID:
			EC.func.LoadSavedContacts();
	}
});

$.ajaxSetup ({
	// Disable caching of AJAX responses
	cache: false
});

$(document).on("pagecontainerbeforeshow", function(event, data)
{
	var currentPage = $.mobile.activePage.attr("id");
	
	var showHeader = true;
	var showFooter = true;
	
	var headerLabel;
	var subHeaderLabel;
	var footerLabel;
	
	var showBackButton = true;
	var showHomeButton = true;
	
	var showAddButton = false;
	var showAddPhoneBook = false;
	var showSaveButton = false;
	var showCancelButton = false;
	var showDeleteButton = false;
	var showEditButton = false;
	var showGroupsButton = false;
	
	switch(currentPage)
	{
		case C.IndexID:
			IN.func.Init();
			headerLabel = "Home";
			subHeaderLabel = "Welcome";
			showBackButton = false;
			showHomeButton = false;
			break;
		
		case C.ScriptsLevel1_2ID:
			SL1_2.func.LoadLevel1_2();
			headerLabel = "Scripts";
			showBackButton = false;
			break;
			
		case C.ScriptsLevel3ID:
			SL3.func.LoadLevel3();
			headerLabel = "Scripts";
			subHeaderLabel = GetSession(C.ScriptsLevel1Value) + ' > ' + GetSession(C.ScriptsLevel2Value);
			break;
			
		case C.RelationshipHomeID:
			headerLabel = "Relationship Maintenance";
			showAddButton = true;
			showAddPhoneBook = true;
			showBackButton = false;
			showGroupsButton = true;
			break;
		
		case C.ContactViewID:
			headerLabel = "View Contact";
			showEditButton = true;
			showDeleteButton = true;
			break;
			
		case C.ContactEditID:
			headerLabel = "Edit Contact";
			showSaveButton = true;
			break;
			
		case C.EmergencyContactsID:
			headerLabel = "Emergency Contacts";
			showAddButton = true;
			showAddPhoneBook = true;
			showBackButton = false;
			break;
			
		default:
			footerLabel = "";
			break;
	}
	
	var headerHTML = "";
	var footerHTML = "";
	
	if(showHeader)
	{
		headerHTML = '<div data-role="header" data-position="fixed" data-id="LifeAppHeader">';
		
		headerHTML += '<div data-type="horizontal" data-role="controlgroup" class="ui-btn-left">';
		
		if(showHomeButton)
		{
			headerHTML += '<a id="HeaderHomeButton" href="#" onClick="Navigate(C.IndexID);" data-role="button" data-icon="home" data-iconpos="notext">Home</a>';
		}
		
		if(showBackButton)
		{
			headerHTML += '<a id="HeaderBackButton" href="#" onClick="NavigateBack();" data-role="button" data-icon="arrow-l" data-iconpos="notext">Back</a>';
		}
		
		headerHTML += '</div>';
				
		headerHTML += '<h1><label style="font-weight: bold;" id="HeaderLabel">' + headerLabel + '</label></h1>';
			
		headerHTML += '<div data-type="horizontal" data-role="controlgroup" class="ui-btn-right">';

		if(showGroupsButton)
		{
			headerHTML += '<a id="HeaderGroupsButton" href="#" onClick="EditGroups();" data-role="button" data-icon="grid" data-iconpos="notext">Edit Groups</a>';
		}
		
		if(showAddPhoneBook)
		{
			headerHTML += '<a id="HeaderAddButton" href="#" onClick="AddPhoneBook();" data-role="button" data-icon="search" data-iconpos="notext">Add PhoneBook</a>';
		}
		
		if(showAddButton)
		{
			headerHTML += '<a id="HeaderAddButton" href="#" onClick="Add();" data-role="button" data-icon="plus" data-iconpos="notext">Add</a>';
		}
		
		headerHTML += '</div>';
		
		if(!IsNullOrUndefinedOrEmpty(subHeaderLabel))
		{
			headerHTML += '<div data-theme="b" class="ui-bar ui-bar-b">' +
								'<label id="HeaderLabel">' + subHeaderLabel + '</label>' +
							'</div>';
		}
		
		headerHTML += '</div>';
	}
	
	if(showFooter)
	{
		footerHTML = '<div data-role="footer" data-position="fixed" data-id="LifeAppFooter">';
		
		var footerButtonCount = 0;
		
		if(showSaveButton) footerButtonCount++;
		if(showCancelButton) footerButtonCount++;
		if(showDeleteButton) footerButtonCount++;
		if(showEditButton) footerButtonCount++;
		
		if(footerButtonCount > 0)
		{
			var footerButtonHTML = "";
			
			switch(footerButtonCount)
			{
				case 1:
					footerButtonHTML = "[BUTTON0]";
					break;
					
				case 2:
					footerButtonHTML = 
						'<div class="ui-grid-a">' +
							'<div class="ui-block-a">[BUTTON0]</div>' +
							'<div class="ui-block-b">[BUTTON1]</div>' +
						'</div>';
					break;
					
				case 3:
					footerButtonHTML = 
						'<div class="ui-grid-b">' +
							'<div class="ui-block-a">[BUTTON0]</div>' +
							'<div class="ui-block-b">[BUTTON1]</div>' +
							'<div class="ui-block-c">[BUTTON2]</div>' +
						'</div>';
					break;
					
				case 4:
					footerButtonHTML = 
						'<div class="ui-grid-c">' +
							'<div class="ui-block-a">[BUTTON0]</div>' +
							'<div class="ui-block-b">[BUTTON1]</div>' +
							'<div class="ui-block-c">[BUTTON2]</div>' +
							'<div class="ui-block-d">[BUTTON3]</div>' +
						'</div>';
					break;
					
				default:
					break;
			}
			
			var currentFooterButtonCount = 0;
			
			if(showSaveButton)
			{
				footerButtonHTML = footerButtonHTML.replace("[BUTTON" + currentFooterButtonCount + "]", "<a href='#' data-role='button' style='width:90%' onClick='Save();'>Save</a>");
				currentFooterButtonCount++;
			}
			
			if(showEditButton)
			{
				footerButtonHTML = footerButtonHTML.replace("[BUTTON" + currentFooterButtonCount + "]", "<a href='#' data-role='button' style='width:90%' onClick='Edit();'>Edit</a>");
				currentFooterButtonCount++;
			}
			
			if(showDeleteButton)
			{
				footerButtonHTML = footerButtonHTML.replace("[BUTTON" + currentFooterButtonCount + "]", "<a href='#' data-role='button' style='width:90%' onClick='Delete();'>Delete</a>");
				currentFooterButtonCount++;
			}
			
			if(showCancelButton)
			{
				footerButtonHTML = footerButtonHTML.replace("[BUTTON" + currentFooterButtonCount + "]", "<a href='#' data-role='button' style='width:90%' onClick='Cancel();'>Cancel</a>");
				currentFooterButtonCount++;
			}
			
			footerHTML += footerButtonHTML;
		}
		
		if(IsNullOrUndefinedOrEmpty(footerLabel))
		{
			if(currentFooterButtonCount == 0)
			{
				footerHTML += '<br/>';
			}
		}
		else
		{
			footerHTML += '<label id="FooterLabel">' + footerLabel + '</label>';
		}
			
		footerHTML += '</div>';
	}
	
	$("#" + currentPage).append(headerHTML).append(footerHTML).trigger('create');
});

function OnError(errorCode, showAlert, message)
{
	if(IsNullOrUndefinedOrEmpty(message))
	{
		message = C.ErrorOccurred;
	}
	
	console.log(message + "(Error Code: " + errorCode + ")");
	
	if(showAlert)
	{
		alert(C.ErrorOccurred + "(Error Code: " + errorCode + ")");
	}
}

function GetContactName(contact)
{
	var name = (CheckObjectProperty(contact, "displayName", false))? contact.displayName: "";
	
	if(!name || name === "") {
		if(CheckObjectProperty(contact.name, "formatted", false)) return contact.name.formatted;
		if(CheckObjectProperty(contact.name, "givenName", false) && CheckObjectProperty(contact.name, "familyName", false)) return contact.name.givenName + " " + contact.name.familyName;
		return "";
	}
	
	return name;
}

function CheckObjectProperty(object, property, isArray)
{
	if(!IsNullOrUndefinedOrEmpty(object))
	{
		if(!IsUndefined(typeof object) && (typeof object === "object"))
		{
			if(object.hasOwnProperty(property))
			{
				var value = object[property];
				
				if(!IsNullOrUndefined(value))
				{
					if(!IsNullOrUndefinedOrEmpty(isArray))
					{
						if(isArray)
						{
							if(value.constructor === Array)
							{
								if(value.length >= 0)
								{
									return true;
								}
							}
						}
						else
						{
							return true;
						}
					}
					else
					{
						return true;
					}
				}
			}
		}
	}
	
	return false;
}

/*function GetThumbnail(original, scale)
{
	  var canvas = document.createElement("canvas")

	  canvas.width = original.width * scale
	  canvas.height = original.height * scale

	  canvas.getContext("2d").drawImage(original, 0, 0, canvas.width, canvas.height)

	  return canvas
}*/

function GetContactImageSource(contact, callback)
{
	db.transaction(function (tx)
	{
		tx.executeSql(
			'SELECT photo FROM contacts WHERE id = ?', 
			[contact.uuid],
			function (tx, results)
			{
				var imageSource = C.NoContactImagePath;

				if(results.rows.length == 1)
				{
					if(!IsNullOrUndefinedOrEmpty(results.rows.item(0).photo))
					{
						//imageSource = "data:image/png;base64," + results.rows.item(0).photo;
						imageSource = results.rows.item(0).photo;
					}
				}
				else if(CheckObjectProperty(contact, "photos", true))
				{
					if(contact.photos.length > 0)
					{
						if(CheckObjectProperty(contact.photos[0], "type", false) && CheckObjectProperty(contact.photos[0], "value", false))
						{
							switch(contact.photos[0].type)
							{
								case "url":
									imageSource = contact.photos[0].value;
									break;
							}
						}
					}
				}
				
				if(!IsNullOrUndefinedOrEmpty(callback))
				{
					callback(contact, imageSource);
				}
			},
			function (tx, error)
			{
				OnError("C-111", true, error.message);
			}
		);
	});
}

/*var tempImage = null;

function GetContactImageSource(contact)
{
	var imageSource = C.NoContactImagePath;
//GetContactImage(uuid)
	if(CheckObjectProperty(contact, "photo", false))
	{
		imageSource = "data:image/png;base64, " + contact.photo;
	}
	
	tempImage = null;
	var imageSource;
		
	GetContactImage(contact.uuid);
	
	while(IsNull(tempImage))
	{
	}
	
	imageSource = tempImage;
	
	if(!IsEmpty(imageSource))
	{
		imageSource = "data:image/png;base64, " + imageSource;
	}
	else if(CheckObjectProperty(contact, "photos", true))
	{
		if(contact.photos.length > 0)
		{
			if(CheckObjectProperty(contact.photos[0], "type", false) && CheckObjectProperty(contact.photos[0], "value", false))
			{
				switch(contact.photos[0].type)
				{
					case "url":
						imageSource = contact.photos[0].value;
						break;
				}
			}
		}
	}
	
	tempImage = null;
	
	return IsNullOrUndefinedOrEmpty(imageSource)? C.NoContactImagePath: imageSource;
}*/

function GetBase64Image(img)
{
	img = img[0]; //gives DOM of selected jquery object
	
    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    if(canvas.width > 200)
    {
    	canvas.width = 200;
    }
    
    if(canvas.height > 200)
    {
    	canvas.height = 200;
    }
    
    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Get the data-URL formatted image
    var dataURL = canvas.toDataURL("image/png");

    return dataURL;
    //return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

function InsertContact(contact, index)
{
	var insertedContactIndex = -1;
	
	if(!IsNull(index) && !isNaN(index))
	{
		if(index >= 0 && index < savedContacts.length)
		{
			if(GetContactName(contact) == GetContactName(savedContacts[index]))
			{
				savedContacts[index] = contact;
				insertedContactIndex = index;
			}
			else
			{
				DeleteContact(index);
				insertedContactIndex = InsertContact(contact);
			}
			
			UpdateContactDB(contact);
		}
	}
	else
	{
		if(savedContacts.length == 0)
		{
			savedContacts.push(contact);
			insertedContactIndex = 0;
		}
		else
		{
			for(var contactIndex = 0; contactIndex < savedContacts.length; contactIndex++)
			{
				if(GetContactName(savedContacts[contactIndex]) >= GetContactName(contact))
				{
					break;
				}
			}

			savedContacts.splice(contactIndex, 0, contact);
			insertedContactIndex = contactIndex;
		}
		
		InsertContactDB(contact);
	}
	
/*	if(insertedContactIndex != -1)
	{
		savedContacts[insertedContactIndex].photo = null;
	}*/
	
	return insertedContactIndex;
}

function DeleteContact(index)
{
	if(index >= 0 && index < savedContacts.length)
	{
		DeleteContactDB(savedContacts[index]);
		savedContacts.splice(index, 1);
	}
}

/*function GetContactImage(uuid)
{
//savedContacts = [];
	
	db.transaction(function (tx) {
		tx.executeSql(
			'SELECT photo FROM contacts WHERE id = ?', 
			[uuid],
			function (tx, results)
			{
				if(results.rows.length == 1)
				{
					tempImage = results.rows.item(0).photo;

					//return results.rows.item(0).photo;
				}
				
				tempImage = "";
				
				//return null;
				
				for (var index = 0; index < results.rows.length; index++)
				{
					var row = results.rows.item(index);
					
					var contact = new Object();
					contact.uuid = row.id;
					contact.displayName = row.displayName;
					contact.name = JSON.parse(row.name);
					contact.rating = row.rating;
					contact.phoneNumbers = JSON.parse(row.phoneNumbers);
					contact.emails = JSON.parse(row.emails);
					contact.addresses = JSON.parse(row.addresses);
					contact.physicalDesc = row.physicalDesc;
					contact.metPerson = row.metPerson;
					contact.birthday = JSON.parse(row.birthday);
					contact.personalities = JSON.parse(row.personalities);
					contact.note = row.note;
					contact.photo = null;
					contact.groupID = row.groupID;
					contact.subGroupID = row.subGroupID;
					contact.lastModified = row.lastModified;
					
					savedContacts.push(contact);
				}
			},
			function (tx, error)
			{
				OnError("C-111", true, error.message);
			}
		);
	});
}*/

function UpdateContactDB(contact)
{
	db.transaction(function (tx)
	{
		tx.executeSql(
			"UPDATE contacts SET displayName = ?, name = ?, rating = ?, phoneNumbers = ?, emails = ?, addresses = ?, physicalDesc = ?, metPerson = ?, birthday = ?, personalities = ?, note = ?, photo = ?, groupID = ?, subGroupID = ?, lastModified = ? WHERE id = ?",
			[IsEmpty(GetContactName(contact))? null: GetContactName(contact),
			(CheckObjectProperty(contact, "name", false))? JSON.stringify(contact.name): null,
			(CheckObjectProperty(contact, "rating", false))? contact.rating: null,
			(CheckObjectProperty(contact, "phoneNumbers", true))? JSON.stringify(contact.phoneNumbers): null,
			(CheckObjectProperty(contact, "emails", true))? JSON.stringify(contact.emails): null,
			(CheckObjectProperty(contact, "addresses", true))? JSON.stringify(contact.addresses): null,
			(CheckObjectProperty(contact, "physicalDesc", false))? contact.physicalDesc: null,
			(CheckObjectProperty(contact, "metPerson", false))? contact.metPerson: null,
			(CheckObjectProperty(contact, "birthday", false))? JSON.stringify(contact.birthday): null,
			(CheckObjectProperty(contact, "personalities", true))? JSON.stringify(contact.personalities): null,
			(CheckObjectProperty(contact, "note", false))? contact.note: null,
			(CheckObjectProperty(contact, "photo", false))? contact.photo: null,
			(CheckObjectProperty(contact, "groupID", false))? contact.groupID: null,
			(CheckObjectProperty(contact, "subGroupID", false))? contact.subGroupID: null,
			GetCurrentDateTime(),
			contact.uuid],
		    function (tx, result)
		    {
				contact.photo = null;
		    },
		    function (tx, error)
		    {
		    	OnError("C-109", true, error.message);
		    }
		);
	});
}

function GetCurrentDateTime()
{
	var currentDate = new Date();
	
	var year = currentDate.getFullYear();
	
	var month = currentDate.getMonth();
	if(month < 10)
	{
		month = "0" + month;
	}
	
	var day = currentDate.getDate();
	if(day < 10)
	{
		day = "0" + day;
	}
	
	var hours = currentDate.getHours();
	if(hours < 10)
	{
		hours = "0" + hours;
	}
	
	var minutes = currentDate.getMinutes();
	if(minutes < 10)
	{
		minutes = "0" + minutes;
	}
	
	var seconds = currentDate.getSeconds();
	if(seconds < 10)
	{
		seconds = "0" + seconds;
	}
	
	return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
}

function InsertContactDB(contact)
{
	if(CheckObjectProperty(contact, "uuid", false))
	{
		if(IsNullOrUndefinedOrEmpty(contact.uuid))
		{
			OnError("C-106", true, error.message);
			return;
		}
	}
	else
	{
		OnError("C-107", true, error.message);
		return;
	}
	
	db.transaction(function (tx)
	{
		tx.executeSql(
			"INSERT INTO contacts (id, displayName, name, rating, phoneNumbers, emails, addresses, physicalDesc, metPerson, birthday, personalities, note, photo, groupID, subGroupID, lastModified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			[contact.uuid,
			IsEmpty(GetContactName(contact))? null: GetContactName(contact),
			(CheckObjectProperty(contact, "name", false))? JSON.stringify(contact.name): null,
			(CheckObjectProperty(contact, "rating", false))? contact.rating: null,
			(CheckObjectProperty(contact, "phoneNumbers", true))? JSON.stringify(contact.phoneNumbers): null,
			(CheckObjectProperty(contact, "emails", true))? JSON.stringify(contact.emails): null,
			(CheckObjectProperty(contact, "addresses", true))? JSON.stringify(contact.addresses): null,
			(CheckObjectProperty(contact, "physicalDesc", false))? contact.physicalDesc: null,
			(CheckObjectProperty(contact, "metPerson", false))? contact.metPerson: null,
			(CheckObjectProperty(contact, "birthday", false))? JSON.stringify(contact.birthday): null,
			(CheckObjectProperty(contact, "personalities", true))? JSON.stringify(contact.personalities): null,
			(CheckObjectProperty(contact, "note", false))? contact.note: null,
			(CheckObjectProperty(contact, "photo", false))? contact.photo: null,
			(CheckObjectProperty(contact, "groupID", false))? contact.groupID: null,
			(CheckObjectProperty(contact, "subGroupID", false))? contact.subGroupID: null,
			GetCurrentDateTime()],
            function (tx, result)
            {
				contact.photo = null;
            },
            function (tx, error)
            {
            	OnError("C-108", true, error.message);
            }
        );
	});
}

function DeleteContactDB(contact)
{
	db.transaction(function (tx)
	{
		tx.executeSql(
			"DELETE FROM contacts WHERE id = ?",
			[contact.uuid],
            function (tx, result)
            {
                //console.log("Query Success");
            },
            function (tx, error)
            {
            	OnError("C-109", true, error.message);
            }
        );
	});
}

function LoadSavedContactsObject(callback)
{
	savedContacts = [];
	
	db.transaction(function (tx) {
		tx.executeSql(
			'SELECT contacts.id, contacts.displayName, contacts.name, contacts.rating, contacts.phoneNumbers, contacts.emails, contacts.addresses, contacts.physicalDesc, contacts.metPerson, contacts.birthday, contacts.note, contacts.personalities, contacts.groupID, contacts.subGroupID, contacts.lastModified, groups.label AS groupLabel, groups.color AS groupColor, subGroups.label AS subGroupLabel ' +
			'FROM contacts LEFT OUTER JOIN groups ON contacts.groupID = groups.id LEFT OUTER JOIN subGroups ON contacts.groupID = subGroups.groupID AND contacts.subGroupID = subGroups.id ORDER BY displayName COLLATE NOCASE', 
			[],
			function (tx, results)
			{
				for (var index = 0; index < results.rows.length; index++)
				{
					var row = results.rows.item(index);
					
					var contact = new Object();
					contact.uuid = row.id;
					contact.displayName = row.displayName;
					contact.name = JSON.parse(row.name);
					contact.rating = row.rating;
					contact.phoneNumbers = JSON.parse(row.phoneNumbers);
					contact.emails = JSON.parse(row.emails);
					contact.addresses = JSON.parse(row.addresses);
					contact.physicalDesc = row.physicalDesc;
					contact.metPerson = row.metPerson;
					contact.birthday = JSON.parse(row.birthday);
					contact.personalities = JSON.parse(row.personalities);
					contact.note = row.note;
					contact.photo = null;
					contact.groupID = row.groupID;
					contact.subGroupID = row.subGroupID;
					contact.lastModified = row.lastModified;
					contact.groupLabel = row.groupLabel;
					contact.groupColor = row.groupColor;
					contact.subGroupLabel = row.subGroupLabel;
					
					savedContacts.push(contact);
				}
				
				if(callback)
				{
					callback();
				}
			},
			function (tx, error)
			{
				OnError("C-110", true, error.message);
			}
		);
	});
}

function GetGroupDesc(callback, groupID)
{
	if(isNaN(groupID))
	{
		if(!IsNullOrUndefined(callback))
		{
			callback("");
		}
		
		return;
	}
	
	db.transaction(function (tx) {
		tx.executeSql(
			'SELECT label FROM groups WHERE id = ?', 
			[groupID],
			function (tx, results)
			{
				if(results.rows.length == 1)
				{	
					if(!IsNullOrUndefined(callback))
					{
						callback(results.rows.item(0).label);
					}
				}
				else
				{
					if(!IsNullOrUndefined(callback))
					{
						callback("");
					}
					
					return;
				}
			},
			function (tx, error)
			{
				OnError("C-112b", true, error.message);
			}
		);
	});
}

function GetSubGroupDesc(callback, groupID, subGroupID)
{
	if(isNaN(groupID) || isNaN(subGroupID))
	{
		if(!IsNullOrUndefined(callback))
		{
			callback("");
		}
		
		return;
	}
	
	db.transaction(function (tx) {
		tx.executeSql(
			'SELECT label FROM subGroups WHERE groupID = ? AND id = ?', 
			[groupID, subGroupID],
			function (tx, results)
			{
				if(results.rows.length == 1)
				{	
					if(!IsNullOrUndefined(callback))
					{
						callback(results.rows.item(0).label);
					}
				}
				else
				{
					if(!IsNullOrUndefined(callback))
					{
						callback("");
					}
					
					return;
				}
			},
			function (tx, error)
			{
				OnError("C-112a", true, error.message);
			}
		);
	});
}

function LoadGroups(callback, groupID, subGroupID)
{
	db.transaction(function (tx) {
		tx.executeSql(
			'SELECT * FROM groups ORDER BY label COLLATE NOCASE', 
			[],
			function (tx, results)
			{
				var groups = [];
				
				for (var index = 0; index < results.rows.length; index++)
				{
					var group = results.rows.item(index);
					groups.push(group);
				}
				
				if(!IsNullOrUndefined(callback))
				{
					callback(groups, groupID, subGroupID);
				}
			},
			function (tx, error)
			{
				OnError("C-111", true, error.message);
			}
		);
	});
}

function LoadSubGroups(callback, groupID, subGroupID)
{
	db.transaction(function (tx)
	{
		tx.executeSql(
			'SELECT * FROM subGroups WHERE groupID = ? ORDER BY label COLLATE NOCASE', 
			[groupID],
			function (tx, results)
			{
				var subGroups = [];
				
				for (var index = 0; index < results.rows.length; index++)
				{
					var subGroup = results.rows.item(index);
					subGroups.push(subGroup);
				}
				
				if(!IsNullOrUndefined(callback))
				{
					callback(subGroups, groupID, subGroupID);
				}
			},
			function (tx, error)
			{
				OnError("C-112", true, error.message);
			}
		);
	});
}

function GetGroup(callback, groupID)
{
	db.transaction(function (tx) {
		tx.executeSql(
			'SELECT * FROM groups WHERE id = ?', 
			[groupID],
			function (tx, results)
			{
				var val;
				
				if(results.rows.length == 1)
				{
					val = results.rows.item(0);
					/*var subGroups = [];
					
					for (var index = 0; index < results.rows.length; index++)
					{
						var subGroup = results.rows.item(index);
						subGroups.push(subGroup);
					}*/
				}
				
				if(!IsNullOrUndefined(callback))
				{
					//callback(subGroups, groupID, subGroupID);
					callback(val);
				}
			},
			function (tx, error)
			{
				OnError("C-112", true, error.message);
			}
		);
	});
}

function GetSubGroup(callback, groupID, subGroupID)
{
	db.transaction(function (tx)
	{
		tx.executeSql(
			'SELECT SG.*, G.label AS groupLabel FROM subGroups SG INNER JOIN groups G ON SG.groupID = G.id WHERE SG.groupID = ? AND SG.id = ?', 
			[groupID, subGroupID],
			function (tx, results)
			{
				var val;
				
				if(results.rows.length == 1)
				{
					val = results.rows.item(0);
				}
				
				if(!IsNullOrUndefined(callback))
				{
					callback(val);
				}
			},
			function (tx, error)
			{
				OnError("C-112", true, error.message);
			}
		);
	});
}

/*function GetSubGroup(callback, groupID, subGroupID)
{
	db.transaction(function (tx) {
		tx.executeSql(
			'SELECT G.id AS groupID, G.label as groupLabel, G.Desc AS groupDesc, G.color AS groupColor, G.sysKey AS groupSysKey, SG.id AS subGroupID, SG.label as subGroupLabel, SG.Desc AS subGroupDesc, SG.sysKey AS subGroupSysKey FROM groups G LEFT OUTER JOIN subGroups SG ON G.id = SG.groupID WHERE G.id = ? AND SG.groupID = ? AND SG.id = ?', 
			[groupID, groupID, subGroupID],
			function (tx, results)
			{
				var subGroups = [];
				
				for (var index = 0; index < results.rows.length; index++)
				{
					var subGroup = results.rows.item(index);
					subGroups.push(subGroup);
				}
				
				if(!IsNullOrUndefined(callback))
				{
					callback(subGroups, groupID, subGroupID);
				}
			},
			function (tx, error)
			{
				OnError("C-112", true, error.message);
			}
		);
	});
}*/

function InsertGroup(group, callback)
{
	var currentDateTime = GetCurrentDateTime();
	
	db.transaction(function (tx)
	{
		tx.executeSql(
			"INSERT INTO groups (label, desc, color, sysKey, lastModified) VALUES (?, ?, ?, ?, ?)",
			[group.label,
			group.desc,
			group.color,
			'',
			currentDateTime],
            function (tx, result) {
				db.transaction(function (tx) {
					tx.executeSql(
						'SELECT id FROM groups WHERE label = ? AND desc = ? AND sysKey = ? AND lastModified = ?', 
						[group.label,
						group.desc,
						'',
						currentDateTime],
						function (tx, results)
						{
							if(results.rows.length == 1 && !IsNullOrUndefined(callback))
							{
								callback(results.rows.item(0).id);
							}
						},
						function (tx, error)
						{
							OnError("C-112", true, error.message);
						}
					);
				});
            },
            function (tx, error) {
            	OnError("C-108", true, error.message);
            }
        );
	});
}

function InsertSubGroup(subGroup, callback)
{
	var currentDateTime = GetCurrentDateTime();
	
	db.transaction(function (tx)
	{
		tx.executeSql(
			"INSERT INTO subGroups (groupID, label, desc, color, sysKey, lastModified) VALUES (?, ?, ?, ?, ?, ?)",
			[subGroup.groupID,
			subGroup.label,
			subGroup.desc,
			'',
			'',
			currentDateTime],
            function (tx, result) {
				db.transaction(function (tx) {
					tx.executeSql(
						'SELECT id, groupID FROM subGroups WHERE groupID = ? AND label = ? AND desc = ? AND sysKey = ? AND lastModified = ?', 
						[subGroup.groupID,
						subGroup.label,
						subGroup.desc,
						'',
						currentDateTime],
						function (tx, results)
						{
							if(results.rows.length == 1 && !IsNullOrUndefined(callback))
							{
								callback(results.rows.item(0).groupID, results.rows.item(0).id);
							}
						},
						function (tx, error)
						{
							OnError("C-112", true, error.message);
						}
					);
				});
            },
            function (tx, error) {
            	OnError("C-108", true, error.message);
            }
        );
	});
}

function UpdateGroupSubGroupContacts(oldGroupID, oldSubGroupID, newGroupID, newSubGroupID, callback)
{
	if(oldGroupID && oldSubGroupID)
	{
		db.transaction(function (tx)
		{
			tx.executeSql(
				"UPDATE contacts SET groupID = ?, subGroupID = ?, lastModified = ? WHERE groupID = ? AND subGroupID = ?",
				[newGroupID,
				 newSubGroupID,
				 GetCurrentDateTime(),
				 oldGroupID,
				 oldSubGroupID],
			    function (tx, result)
			    {
					if(callback)
					{
						callback(oldGroupID, oldSubGroupID, newGroupID, newSubGroupID);
					}
			    },
			    function (tx, error)
			    {
			    	OnError("C-109", true, error.message);
			    }
			);
		});
	}
	else if(oldGroupID)
	{
		db.transaction(function (tx)
		{
			tx.executeSql(
				"UPDATE contacts SET groupID = ?, subGroupID = ?, lastModified = ? WHERE groupID = ?",
				[newGroupID,
				 newSubGroupID,
				 GetCurrentDateTime(),
				 oldGroupID],
			    function (tx, result)
			    {
					if(callback)
					{
						callback(oldGroupID, oldSubGroupID, newGroupID, newSubGroupID);
					}
			    },
			    function (tx, error)
			    {
			    	OnError("C-109", true, error.message);
			    }
			);
		});
	}
}

function UpdateGroup(group, callback)
{
	db.transaction(function (tx)
	{
		tx.executeSql(
			"UPDATE groups SET label = ?, desc = ?, color = ?, lastModified = ? WHERE id = ?",
			[group.label,
			(CheckObjectProperty(group, "desc", false))? group.desc: null,
			(CheckObjectProperty(group, "color", false))? group.color: null,
			GetCurrentDateTime(),
			group.id],
            function (tx, result)
            {
				if(callback)
				{
					callback();
				}
            },
            function (tx, error)
            {
            	OnError("C-109", true, error.message);
            }
        );
	});
}

function UpdateSubGroup(subGroup, callback)
{
	var oldGroupID;
	
	db.transaction(function (tx)
	{
		tx.executeSql(
			"SELECT groupID FROM subGroups WHERE id = ?",
			[subGroup.id],
		    function (tx, result)
		    {
				if(result.rows.length == 1)
				{
					oldGroupID = result.rows.item(0).groupID;
					
					db.transaction(function (tx)
					{
						tx.executeSql(
							"UPDATE subGroups SET groupID = ?, label = ?, desc = ?, color = ?, lastModified = ? WHERE id = ?",
							[subGroup.groupID,
							subGroup.label,
							(CheckObjectProperty(subGroup, "desc", false))? subGroup.desc: null,
							(CheckObjectProperty(subGroup, "color", false))? subGroup.color: null,
							GetCurrentDateTime(),
							subGroup.id],
						    function (tx, result)
						    {
								if(oldGroupID != subGroup.groupID)
								{
									UpdateGroupSubGroupContacts(oldGroupID, subGroup.id, subGroup.groupID, subGroup.id, callback);
								}
								else
								{
									if(callback)
									{
										callback();
									}
								}
						    },
						    function (tx, error)
						    {
						    	OnError("C-109", true, error.message);
						    }
						);
					});
				}
		    },
		    function (tx, error)
		    {
		    	OnError("C-109", true, error.message);
		    }
		);
	});
}

function DeleteGroup(groupID, callback)
{
	UpdateGroupSubGroupContacts(groupID, null, null, null, function() { DeleteGroupContinue(groupID, callback); });
}

function DeleteGroupContinue(groupID, callback)
{
	db.transaction(function (tx)
	{
		tx.executeSql(
			"DELETE FROM groups WHERE id = ?",
			[groupID],
            function (tx, result)
            {
				if(callback)
				{
					callback();
				}
            },
            function (tx, error)
            {
            	OnError("C-109", true, error.message);
            }
        );
	});
}

function DeleteSubGroup(groupID, subGroupID, callback)
{
	UpdateGroupSubGroupContacts(groupID, subGroupID, groupID, null, function() { DeleteSubGroupContinue(groupID, subGroupID, callback); });
}

function DeleteSubGroupContinue(groupID, subGroupID, callback)
{
	db.transaction(function (tx)
	{
		tx.executeSql(
			"DELETE FROM subGroups WHERE groupID = ? AND id = ?",
			[groupID,
			 subGroupID],
            function (tx, result)
            {
				if(callback)
				{
					callback();
				}
            },
            function (tx, error)
            {
            	OnError("C-109", true, error.message);
            }
        );
	});
}

function ExitApp()
{
	device.exitApp();
	
    //navigator.notification.confirm("Are you sure you want to exit ?", onConfirmExit, "Confirmation", "Yes,No"); 

//	alert('here');
	//navigator.app.exitApp();	
}

function onConfirmExit(button) {
    if(button==2){//If User selected No, then we just do nothing
        return;
    }else{
        navigator.app.exitApp();// Otherwise we quit the app.
    }
}

$.widget( "ui.tabs", $.ui.tabs, {
	_createWidget: function( options, element ) {
	    var page, delayedCreate,
	        that = this;

	    if ( $.mobile.page ) {
	        page = $( element )
	            .parents( ":jqmData(role='page'),:mobile-page" )
	            .first();

	        if ( page.length > 0 && !page.hasClass( "ui-page-active" ) ) {
	            delayedCreate = this._super;
	            page.one( "pagebeforeshow", function() {
	                delayedCreate.call( that, options, element );
	            });
	        }
	    } else {
	        return this._super();
	    }
	}
});

function GenerateUUID()
{
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

function IsNull(value)
{
	if(value === null)
	{
		return true;
	}
	else if(value === "null")
	{
		return true;
	}
	
	return false;
}

function IsUndefined(value)
{
	if(value === undefined)
	{
		return true;
	}
	else if(value === "undefined")
	{
		return true;
	}
	
	return false;
}

function IsEmpty(value)
{
	if(!IsUndefined(typeof value) && (typeof value === "string"))
	{
		if(value.trim() === "")
		{
			return true;
		}
	}
	
	return false;
}

function IsNullOrUndefined(value)
{
	if(IsNull(value))
	{
		return true;
	}
	else if(IsUndefined(value))
	{
		return true;
	}
	
	return false;
}

function IsNullOrEmpty(value)
{
	if(IsNull(value))
	{
		return true;
	}
	else if(IsEmpty(value))
	{
		return true;
	}
	
	return false;
}

function IsNullOrUndefinedOrEmpty(value)
{
	if(IsNull(value))
	{
		return true;
	}
	else if(IsUndefined(value))
	{
		return true;
	}
	else if(IsEmpty(value))
	{
		return true;
	}
	
	return false;
}

function Navigate(pageID, trans)
{
	if(IsNullOrUndefined(trans))
	{
		trans = "none";
	}
	
	$.mobile.pageContainer.pagecontainer("change", pageID + ".html", { transition: trans });
}

function NavigateBack()
{
	var currentPage = $.mobile.activePage.attr("id");
	
	switch(currentPage)
	{
		case C.IndexID:
			ExitApp();
			break;
		
		case C.ScriptsLevel1_2ID:
			Navigate(C.IndexID);
			break;

		case C.ScriptsLevel3ID:
			Navigate(C.ScriptsLevel1_2ID);
			break;
			
		case C.RelationshipHomeID:
			Navigate(C.IndexID);
			break;

		case C.ContactViewID:
			Navigate(GetSession(C.ContactSource));
			break;
			
		case C.ContactEditID:
			switch(GetSession(C.ContactMode)) {
				case C.ContactPhonebook:
				case C.ContactNew:
					Navigate(GetSession(C.ContactSource));
					break;
					
				case C.ContactEdit:
					Navigate(C.ContactViewID);
					break;
					
				default:
					Navigate(C.IndexID);
			}

			break;
			
		case C.EmergencyContactsID:
			Navigate(C.IndexID);
			break;
			
		default:
			break;
	}
}

function SetLocal(key, value)
{
	localStorage.setItem(key, value);
}

function GetLocal(key)
{
	return localStorage.getItem(key);
}

function RemoveLocal()
{
	localStorage.removeItem(key);
}

function SetSession(key, value)
{
	sessionStorage.setItem(key, value);
}

function GetSession(key)
{
	return sessionStorage.getItem(key)
}

function RemoveSession(key)
{
	sessionStorage.removeItem(key);
}

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function CapitalizeFirstLetter(value)
{
	if(!IsNullOrUndefinedOrEmpty(value))
	{
		return value.capitalizeFirstLetter();
	}
	
	return "";
}

function ToUpperCase(value)
{
	if(!IsNullOrUndefinedOrEmpty(value))
	{
		return value.toUpperCase();
	}
	
	return "";
}