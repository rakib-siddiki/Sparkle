import { BsThreeDotsVertical } from "react-icons/bs";
import { getDatabase, ref, onValue, set, remove } from "firebase/database";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import NoData from "../noDataToShow/NoData";
import LoadingSpinner from "../handleloading/LoadingSpinner";
import { PropTypes } from "prop-types";
import { fillterdMyGroups } from "../reUseAble/Searching";
import MyGroupListItem from "../reUseAble/listItems/MyGroupListItem";
const MyGroups = ({ searchQuery }) => {

  
  

  const [loading, setLoading] = useState(true);

  const [myGroupsList, setMyGroupsList] = useState([]);
  const [getJoinRequest, setGetJoinRequest] = useState([]);
  const data = useSelector((state) => state.userInfo.userValue); // getting value from store
  const db = getDatabase();
  // my own group
  useEffect(() => {
    const myGroupsRef = ref(db, "grouplist/");
    onValue(myGroupsRef, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
        if (data.uid == item.val().adminId) {
          arr.push({ ...item.val(), id: item.key });
        }
        if (data.uid == item.val().othersGroupId) {
          arr.push({ ...item.val(), id: item.key });
        }
      });

      setMyGroupsList(arr);
      setLoading(false);
    });
  }, [data.uid, db]);
  //  get groupJoinRequests
  useEffect(() => {
    const getJoinRequestRef = ref(db, "groupJoinRequest/");
    onValue(getJoinRequestRef, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
        if (data.uid == item.val().adminId) {
          arr.push({ ...item.val(), JoinId: item.key });
        }
      });

      setGetJoinRequest(arr);
    });
  }, [data.uid, db]);
  // Acepting group request
  const acceptGroupRequest = (item) => {
    set(ref(db, "grouplist/" + item.id), {
      admin: item.admin,
      adminId: item.senderId,
      othersGroupId: item.adminId,
      groupName: item.groupName,
      groupTitle: item.groupTitle,
      id: item.id,
    }).then(() => remove(ref(db, "groupJoinRequest/" + item.JoinId)));
  };
  const cancleGroupRequest = (item) => {
     remove(ref(db, "groupJoinRequest/" + item.JoinId))
  };

  // search method filltering 
  const fillterdMyGroupsList = fillterdMyGroups(myGroupsList,searchQuery)
  return (
    <>
      <div className="w-[32%] h-[355px] pt-5 pb-1.5 pl-5 pr-[22px] rounded-20px shadow-CardShadow">
        <div className="flex justify-between mb-2">
          <h3 className="font-pops text-xl font-semibold">My Groups</h3>
          <div className="text-2xl cursor-pointer text-primary">
            <BsThreeDotsVertical />
          </div>
        </div>

        <ul className=" h-[86%] overflow-y-auto">
          {loading ? (
            <LoadingSpinner />
          ) : myGroupsList.length === 0 ? (
            <NoData />
          ) : searchQuery ? (
            fillterdMyGroupsList.length > 0 ? (
              fillterdMyGroupsList.map((item, i) => (
                <MyGroupListItem type="myGroupList" key={i} item={item} />
              ))
            ) : (
              <NoData />
            )
          ) : (
            myGroupsList.map((item, i) => (
              <MyGroupListItem type="myGroupList" key={i} item={item} />
            ))
          )}
          {getJoinRequest.map((item, i) => (
            <MyGroupListItem
              type="joinRequestlist"
              key={i}
              item={item}
              acceptGroupRequest={acceptGroupRequest}
              cancleGroupRequest={cancleGroupRequest}
            />
          ))}
        </ul>
      </div>
    </>
  );
};
MyGroups.propTypes = {
  searchQuery: PropTypes.string.isRequired,
};
export default MyGroups;
