import { useEffect, useState, useMemo } from 'react';
import { getUsers, deleteUserField} from '../../firebase';
import Loader from '../../components/Loader/Loader';
import UserCard from '../../components/UserCard/UserCard';
import './ListUsers.scss';
import ScrollToTop from '../../pages/ScrollToTop';
import AppHelmet from '../../pages/AppHelmet';
import { FiSearch } from 'react-icons/fi';
import { useSetRecoilState } from 'recoil';
import { notificationState } from '../../recoil/atoms';

export default function ListUsers() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const setNotification = useSetRecoilState(notificationState);

  useEffect(() => {
    getUsers(setUsers, setLoading);
  }, []);

  // Filter and search users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Filter by subscription type
      const matchesFilter = filterType === 'all' ||
                           (filterType === 'free' && !user.isPremium) ||
                           (filterType === 'premium' && user.isPremium) ||
                           (filterType === "withLocality" && user.locality);           

      // Search across multiple fields
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        (user.email && user.email.toLowerCase().includes(searchLower)) ||
        (user.username && user.username.toLowerCase().includes(searchLower)) ||
        (user.subscription && user.subscription.subDate &&
         user.subscription.subDate.toLowerCase().includes(searchLower)) ||
        (user.subscription && user.subscription.plan &&
         user.subscription.plan.toLowerCase().includes(searchLower));

      return matchesFilter && matchesSearch;
    });
  }, [users, searchTerm, filterType]);

  return (
    <div className='list-users'>
      <ScrollToTop />
      <AppHelmet title={"All Users"} />

      {/* Search and Filter Controls */}
      <div className="users-controls">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by email, username, subDate, or plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-dropdown">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Users</option>
            <option value="free">Free Plan</option>
            <option value="premium">Premium Users</option>
            <option value="withLocality">With Locality</option>
          </select>
        </div>
      </div>

      {loading && <Loader />}

      {/* Results count */}
      {!loading && (
        <div className="results-info">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      )}

      {/* Users list */}
      <div className="users-grid">
        {filteredUsers.length > 0 ? (
          filteredUsers.map(user => {
            /*if (user.subDate) {
              console.log(user);
              deleteUserField(user.email, setNotification)
            }*/
            return <UserCard key={user.email} user={user} />;
          })          
        ) : (
          !loading && (
            <div className="no-results">
              <p>No users found matching your criteria</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}