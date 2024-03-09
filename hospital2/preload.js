const { contextBridge, ipcRenderer } = require('electron');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const tokenFilePath = path.join(__dirname, 'token.json');
const secretKey = 'houdaPOP1223';

function getUserID() {
  try {
    const token = fs.readFileSync(tokenFilePath, 'utf-8');

    if (!token) {
      console.error('Token not found or empty.');
      return null;
    }

    const decoded = jwt.verify(token, secretKey);


    if (decoded.exp * 1000 < Date.now()) {
      console.error('Token has expired.'); 
      return null;
    }

    const userId = decoded.userId;
    return userId;
  } catch (error) {
    console.error('Error in getUserID:', error.message);
    return null;
  }
}




function getUserRole() {
  try {
    const token = fs.readFileSync(tokenFilePath, 'utf-8');

    if (token) {
      const decoded = jwt.verify(token, secretKey);
      if (decoded.exp * 1000 < Date.now()) {
        alert('Your session has expired. Please log in again.');
        return null;
      }
      return decoded.isAdmin; // Assuming the role is included in the JWT payload
    }
  } catch (error) {
    console.error('Error reading or verifying JWT:', error.message);
  }

  return null;
}

contextBridge.exposeInMainWorld('electron', {
  messageMain: (channel,message)=>{
let valedChannels = ['send-alert']
if(valedChannels.includes(channel)){
 return  ipcRenderer.invoke(channel,message)
}
  },
getUserRole: ()=> getUserRole(),
getUserID: ()=> getUserID(),

   getUserInfo: () => {
    try {
      const token = fs.readFileSync(tokenFilePath, 'utf-8');

      if (!token) {
        console.error('Token not found or empty.');
        return null;
      }

      const decoded = jwt.verify(token, secretKey);

      if (decoded.exp * 1000 < Date.now()) {
        console.error('Token has expired.');
        return null;
      }

      const userInfo = {
        userId: decoded.userId,
        username: decoded.username, // Assuming username is included in the JWT payload
        isAdmin: decoded.isAdmin, // Assuming the role is included in the JWT payload
      };

      return userInfo;
    } catch (error) {
      console.error('Error in getUserInfo:', error.message);
      return null;
    }
  },

  
  signUp: async (username, password) => {
    return new Promise((resolve, reject) => {
      ipcRenderer.once('signUpResponse', (event, success, message) => {
        if (success) {
          resolve();
        } else {
          reject(message);
        }
      });

      ipcRenderer.send('signUp', { username, password });
    });
  },

login: async (username, password) => {
  try {
    const user = await new Promise((resolve, reject) => {
      ipcRenderer.once('loginResponse', (event, user,error) => {
        if (user) {
          resolve(user);
        } else {
reject(new Error('Invalid username or password'))
        }
      });

      ipcRenderer.send('login', { username, password });
    });


    // Replace 'user.userId' with the correct property that contains the user ID
    if (!user.id) {
      console.error('User ID not found in the login response.');
      throw new Error('User ID not found in the login response.');
    }

    // Include user ID information in the JWT payload
    const token = jwt.sign({username:user.username, userId: user.id, isAdmin: user.isAdmin }, secretKey);
    fs.writeFileSync(tokenFilePath, token, 'utf-8');

    return user;
  } catch (error) {
    console.error('Error during login:', error.message);
    throw error;
  }
},





   generateToken: (userId) => {
    return new Promise((resolve, reject) => {
      jwt.sign({ userId }, secretKey, { expiresIn: '1h' }, (err, token) => {
        if (err) {
          reject(err);
        } else {
          resolve(token);
        }
      });
    });
  },
  addCure: async (name, type,quantity, userId, date) => {
    return new Promise((resolve, reject) => {
      ipcRenderer.once('addCureResponse', (event, response) => {
        if (response.success) {
          resolve(response.message);
        } else {
          console.error('Error adding cure:', response.message);
          reject(response.message);
        }
      });

      ipcRenderer.send('addCure', { name, type,quantity, userId, date });
    });
  },

   getAllCures: async () => {
    try {
      const userId = await getUserID(); // Wait for the asynchronous operation to complete

      if (!userId) {
        console.error('User ID is undefined or null.');
        throw new Error('User ID is undefined or null.');
      }

      const cures = await new Promise((resolve, reject) => {
        ipcRenderer.once('getAllCuresResponse', (event, cureData) => {
          try {
            const parsedData = JSON.parse(cureData);
            resolve(parsedData);
          } catch (parseError) {
            console.error('Error parsing JSON response:', parseError);
            reject('Error parsing JSON response');
          }
        });

        ipcRenderer.once('error', (event, error) => {
          console.error('IPC Error:', error);
          reject('An error occurred during IPC communication.');
        });

        ipcRenderer.send('getAllCures');
      });

      return cures;
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      throw error;
    }
  },

    editCure: async (cureId, name, type, stock, userId, date) => {
    try {
      return new Promise((resolve, reject) => {
        ipcRenderer.once('editCureResponse', (event, response) => {
          if (response.success) {
            resolve(response.message);
          } else {
            console.error('Error editing cure:', response.message);
            reject(response.message);
          }
        });

        ipcRenderer.send('editCure', cureId, { name, type, stock, userId, date });
      });
    } catch (error) {
      console.error('Error in editCure:', error.message);
      throw error;
    }
  },
    editCureQuantity: async (cureId, stock) => {
    try {
      return new Promise((resolve, reject) => {
        ipcRenderer.once('editCureQuantityResponse', (event, response) => {
          if (response.success) {
            resolve(response.message);
          } else {
            console.error('Error editing cure quantity:', response.message);
            reject(response.message);
          }
        });

        ipcRenderer.send('editCureQuantity', cureId, stock);
      });
    } catch (error) {
      console.error('Error in editCureQuantity:', error.message);
      throw error;
    }
  },

  
   deleteCure: async (cureId) => {
    try {
      return new Promise((resolve, reject) => {
        ipcRenderer.once('deleteCureResponse', (event, response) => {
          if (response.success) {
            resolve(response.message);
          } else {
            console.error('Error deleting cure:', response.message);
            reject(response.message);
          }
        });
        ipcRenderer.send('deleteCure', cureId);
      });
    } catch (error) {
      console.error('Error in deleteCure:', error.message);
      throw error;
    }
  },

addTrackingData: async (trackingData, cureType, cureName,) => {
    try {
      const userId = await getUserID(); 

      if (!userId) {
        console.error('User ID is undefined or null.');
        throw new Error('User ID is undefined or null.');
      }

      return new Promise((resolve, reject) => {
        ipcRenderer.once('addTrackingDataResponse', (event, response) => {
          if (response.success) {
            resolve(response.message);
          } else {
            console.error('Error adding tracking data:', response.message);
            reject(response.message);
          }
        });

        ipcRenderer.send('addTrackingData', trackingData, userId, cureType, cureName);
      });
    } catch (error) {
      console.error('Error in addTrackingData:', error.message);
      throw error;
    }
  },

getTrackingData: async () => {
    try {
      const trackingData = await new Promise((resolve, reject) => {
        ipcRenderer.once('getTrackingDataResponse', (event, data) => {
          if (data !== null) {
            resolve(data);
          } else {
            reject('Error retrieving tracking data.');
          }
        });

        ipcRenderer.send('getTrackingData');
      });

      return trackingData;
    } catch (error) {
      console.error('Error in getTrackingData:', error.message);
      throw error;
    }
  },

  updateTrackingData: async (id, newData) => {
    try {
      const isAdmin = await getUserRole();

      if (isAdmin) {
        return new Promise((resolve, reject) => {
          ipcRenderer.once('updateTrackingDataResponse', (event, response) => {
            if (response.success) {
              resolve(response.message);
            } else {
              console.error('Error updating tracking data:', response.message);
              reject(response.message);
            }
          });

          ipcRenderer.send('updateTrackingData', id, newData);
        });
      } else {
        throw new Error('You do not have permission to update tracking data.');
      }
    } catch (error) {
      console.error('Error in updateTrackingData:', error.message);
      throw error;
    }
  },

  // IPCRenderer handler for deleting tracking data
  deleteTrackingData: async (id) => {
    try {
      console.log(`Initiating deleteTrackingData for ID: ${id}`);
      const isAdmin = await getUserRole();
      if (isAdmin) {
        return new Promise((resolve, reject) => {
        ipcRenderer.once('deleteTrackingDataResponse', (event, response) => {
           console.log('Response received:', response);
  if (response.success) {
    console.log('Delete operation successful:', response.message);
    resolve(response.message);
  } else {
    console.error('Error deleting tracking data:', response.message);
    reject(response.message);
  }
});
ipcRenderer.send('deleteTrackingData', id);
        });
      } else {
        throw new Error('You do not have permission to delete tracking data.');
      }
    } catch (error) {
          console.error('Error in deleteTrackingData function:', error.message);
      throw error;
    }
  },




});
